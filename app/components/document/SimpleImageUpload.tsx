import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAction } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Spinner } from 'heroui-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import { prepareImageForUpload, UploadThingReactNativeFile } from '../../../utils/imageCompression';

interface SimpleImageUploadProps {
    url: string;
    setUrl: (url: string | ((previousValue: string) => string)) => void;
    buttonLabel?: string;
    emptyLabel?: string;
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

const SimpleImageUpload = ({ url, setUrl, buttonLabel = 'Upload Image', emptyLabel = 'Upload image', className = 'h-12 px-5' }: SimpleImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [error, setError] = useState('');
    const generatePublicImageUploadUrl = useAction(api.uploadthing.generatePublicImageUploadUrl);

    const handleFileUpload = async () => {
        try {
            setIsButtonClicked(true);
            setError('');
            
            // Request media library permissions and launch image picker
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access media library is required');
                setIsButtonClicked(false);
                return;
            }

            // Launch image picker with editing enabled
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                // Start uploading only after file is selected
                setIsUploading(true);
                
                // Prepare image for upload
                const preparedFile = await prepareImageForUpload(result.assets[0]);
                
                // Generate presigned upload URL from Convex
                const signedUpload = await generatePublicImageUploadUrl({
                    name: preparedFile.name,
                    size: preparedFile.size,
                    type: preparedFile.type,
                    lastModified: preparedFile.lastModified,
                }) as UploadThingSignedUpload;
                
                // Upload file to UploadThing service
                const uploadedFile = await uploadFileToPresignedUrl(preparedFile, signedUpload);
                const publicUrl = uploadedFile.ufsUrl ?? uploadedFile.url;
                
                // Update URL state
                setUrl(publicUrl);
                setError('');
            } else {
                // User cancelled the file picker
                setIsButtonClicked(false);
            }
        } catch (uploadError) {
            setError('Failed to upload image');
        } finally {
            setIsUploading(false);
            setIsButtonClicked(false);
        }
    };

    return (
        <Column gap={2} className={className}>
            <AppButton 
                variant={isUploading || isButtonClicked ? 'grey' : 'green'} 
                className={`h-12 px-5 ${className}`}
                onPress={handleFileUpload}
                disabled={isUploading || isButtonClicked}
            >
                <Row className='items-center gap-2'>
                    {isUploading && <Spinner size="sm" color="white" />}
                    <PoppinsText weight='medium' color='white'>
                        {buttonLabel}
                    </PoppinsText>
                </Row>
            </AppButton>
            
            {error && (
                <PoppinsText className='text-red-500 text-sm'>{error}</PoppinsText>
            )}
        </Column>
    );
};

export default SimpleImageUpload;
