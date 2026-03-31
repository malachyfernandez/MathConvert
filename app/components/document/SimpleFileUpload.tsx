import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Spinner } from 'heroui-native';
import { Platform } from 'react-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import { prepareImageForUpload, prepareWebFileForUpload, UploadThingReactNativeFile } from '../../../utils/imageCompression';
import { renderPdfFileToImages, isPdfFile } from '../../../utils/pdfToImages';

interface SimpleFileUploadProps {
    onFilesReady: (files: Array<{ id: string; previewUrl: string; file: File; uploadedUrl?: string }>) => void;
    buttonLabel?: string;
    className?: string;
}

interface UploadThingSignedUpload {
    url: string;
    key: string;
}

interface UploadThingUploadedFileResponse {
    url: string;
    appUrl: string;
    ufsUrl: string;
}

const UPLOAD_TIMEOUT_MS = 90000;

const withTimeout = async <T,>(promise: Promise<T>, message: string, timeoutMs: number = UPLOAD_TIMEOUT_MS) => {
    return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            setTimeout(() => reject(new Error(message)), timeoutMs);
        }),
    ]);
};

const getUploadErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return 'Failed to upload file.';
};

const pickWebFile = async () => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        throw new Error('The browser file picker is unavailable in this environment.');
    }

    return await new Promise<File | null>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,application/pdf,.pdf';
        input.style.display = 'none';

        let resolved = false;

        const cleanup = () => {
            window.removeEventListener('focus', handleWindowFocus);
            input.remove();
        };

        const finalize = (file: File | null) => {
            if (resolved) return;
            resolved = true;
            cleanup();
            resolve(file);
        };

        const handleWindowFocus = () => {
            window.setTimeout(() => {
                finalize(input.files?.[0] ?? null);
            }, 300);
        };

        input.onchange = () => finalize(input.files?.[0] ?? null);
        window.addEventListener('focus', handleWindowFocus, { once: true });
        document.body.appendChild(input);
        input.click();
    });
};

const uploadFileToPresignedUrl = async (
    file: UploadThingReactNativeFile,
    signedUpload: UploadThingSignedUpload,
) => {
    return new Promise<UploadThingUploadedFileResponse>(async (resolve, reject) => {
        const formData = new FormData();

        if (file.file) {
            formData.append('file', file.file);
        } else {
            // Create a blob from the URI for React Native
            const response = await fetch(file.uri);
            const blob = await response.blob();
            formData.append('file', blob, file.name);
        }

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedUpload.url, true);
        xhr.setRequestHeader('Range', 'bytes=0-');
        xhr.setRequestHeader('x-uploadthing-version', '7.7.4');
        xhr.responseType = 'json';
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response as UploadThingUploadedFileResponse);
                return;
            }

            reject(new Error(xhr.responseText));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
    });
};

const SimpleFileUpload = ({ onFilesReady, buttonLabel = 'Upload File', className = 'h-12 px-5' }: SimpleFileUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const generatePublicImageUploadUrl = useAction(api.uploadthing.generatePublicImageUploadUrl);

    const handleFileUpload = async () => {
        console.log('🔍 [UPLOAD_DEBUG] handleFileUpload called');
        try {
            setIsButtonClicked(true);
            setError('');
            setStatusMessage('');

            if (Platform.OS === 'web') {
                console.log('🔍 [UPLOAD_DEBUG] Platform is web, opening file picker');
                const selectedFile = await pickWebFile();

                if (!selectedFile) {
                    console.log('🔍 [UPLOAD_DEBUG] No file selected');
                    setIsButtonClicked(false);
                    return;
                }

                console.log('🔍 [UPLOAD_DEBUG] File selected:', selectedFile.name, selectedFile.type);
                setIsUploading(true);

                // Check if it's a PDF
                if (isPdfFile(selectedFile)) {
                    console.log('🔍 [UPLOAD_DEBUG] Detected PDF file, starting PDF processing');
                    setStatusMessage('Rendering PDF pages...');
                    try {
                        const renderedPages = await renderPdfFileToImages(selectedFile);
                        console.log('✅ [UPLOAD_DEBUG] PDF rendered successfully:', renderedPages.length, 'pages');
                        setStatusMessage(`Uploading ${renderedPages.length} pages...`);
                        
                        const uploadedPages = await Promise.all(
                            renderedPages.map(async (page, index) => {
                                console.log(`🔍 [UPLOAD_DEBUG] Processing page ${index + 1} in parallel...`);
                                
                                const preparedFile = await withTimeout(
                                    prepareWebFileForUpload(page.file),
                                    'Preparing the image took too long. Please try a smaller image.',
                                );

                                const signedUpload = await withTimeout(
                                    generatePublicImageUploadUrl({
                                        name: preparedFile.name,
                                        size: preparedFile.size,
                                        type: preparedFile.type,
                                        lastModified: preparedFile.lastModified,
                                    }) as Promise<UploadThingSignedUpload>, 
                                    'Generating the upload URL took too long. Please try again.'
                                );

                                const uploadedFile = await withTimeout(
                                    uploadFileToPresignedUrl(preparedFile, signedUpload),
                                    'Uploading the image took too long. Please try again.',
                                );
                                
                                const publicUrl = uploadedFile.ufsUrl ?? uploadedFile.url;

                                if (!publicUrl) {
                                    throw new Error('Upload completed but no public image URL was returned.');
                                }

                                console.log(`✅ [UPLOAD_DEBUG] Page ${index + 1} uploaded successfully`);

                                return {
                                    id: page.id,
                                    previewUrl: page.previewUrl,
                                    file: page.file,
                                    uploadedUrl: publicUrl,
                                };
                            })
                        );

                        onFilesReady(uploadedPages);
                        setStatusMessage('');
                        return;
                    } catch (pdfError) {
                        throw pdfError;
                    }
                } else {
                    // Handle image file
                    const preparedFile = await withTimeout(
                        prepareWebFileForUpload(selectedFile),
                        'Preparing the image took too long. Please try a smaller image.',
                    );

                    const signedUpload = await withTimeout(
                        generatePublicImageUploadUrl({
                            name: preparedFile.name,
                            size: preparedFile.size,
                            type: preparedFile.type,
                            lastModified: preparedFile.lastModified,
                        }) as Promise<UploadThingSignedUpload>, 
                        'Generating the upload URL took too long. Please try again.'
                    );

                    const uploadedFile = await withTimeout(
                        uploadFileToPresignedUrl(preparedFile, signedUpload),
                        'Uploading the image took too long. Please try again.',
                    );
                    
                    const publicUrl = uploadedFile.ufsUrl ?? uploadedFile.url;

                    if (!publicUrl) {
                        throw new Error('Upload completed but no public image URL was returned.');
                    }

                    onFilesReady([{
                        id: preparedFile.name,
                        previewUrl: publicUrl,
                        file: selectedFile,
                        uploadedUrl: publicUrl, // Add the uploaded URL!
                    }]);
                    return;
                }
            }

            // Native (iOS/Android) - only support images for now
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access media library is required.');
                setIsButtonClicked(false);
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setIsUploading(true);

                const preparedFile = await withTimeout(
                    prepareImageForUpload(result.assets[0]),
                    'Preparing the image took too long. Please try a smaller image.',
                );

                const signedUpload = await withTimeout(
                    generatePublicImageUploadUrl({
                        name: preparedFile.name,
                        size: preparedFile.size,
                        type: preparedFile.type,
                        lastModified: preparedFile.lastModified,
                    }) as Promise<UploadThingSignedUpload>, 
                    'Generating the upload URL took too long. Please try again.'
                );

                const uploadedFile = await withTimeout(
                    uploadFileToPresignedUrl(preparedFile, signedUpload),
                    'Uploading the image took too long. Please try again.',
                );
                
                const publicUrl = uploadedFile.ufsUrl ?? uploadedFile.url;

                if (!publicUrl) {
                    throw new Error('Upload completed but no public image URL was returned.');
                }

                onFilesReady([{
                    id: preparedFile.name,
                    previewUrl: publicUrl,
                    file: result.assets[0].file || new File([], result.assets[0].fileName || 'image'),
                    uploadedUrl: publicUrl, // Add the uploaded URL!
                }]);
            } else {
                setIsButtonClicked(false);
            }
        } catch (uploadError) {
            setError(getUploadErrorMessage(uploadError));
        } finally {
            setIsUploading(false);
            setIsButtonClicked(false);
            setStatusMessage('');
        }
    };

    return (
        <Column gap={2} className={className}>
            <AppButton 
                variant={isUploading || isButtonClicked ? 'grey' : 'black'} 
                className={`h-12 px-5 ${className}`}
                onPress={handleFileUpload}
                disabled={isUploading || isButtonClicked}
            >
                <Row className='items-center gap-2'>
                    {isUploading && <Spinner size="sm" color="white" />}
                    <PoppinsText weight='medium' color='white'>
                        {isUploading ? (statusMessage || 'Uploading...') : buttonLabel}
                    </PoppinsText>
                </Row>
            </AppButton>
            
            {error && (
                <PoppinsText className='text-red-500 text-sm'>{error}</PoppinsText>
            )}
        </Column>
    );
};

export default SimpleFileUpload;
