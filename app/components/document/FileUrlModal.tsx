import React, { useState } from 'react';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import { renderPdfUrlToImages, isPdfUrl } from '../../../utils/pdfToImages';
import { generateId } from '../../../utils/generateId';

interface FileUrlModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onFilesReady: (files: Array<{ id: string; previewUrl: string; file: File; uploadedUrl?: string }>) => void;
}

const FileUrlModal = ({ isOpen, onOpenChange, onFilesReady }: FileUrlModalProps) => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [previewFiles, setPreviewFiles] = useState<Array<{ id: string; previewUrl: string; file: File; uploadedUrl?: string }>>([]);

    const checkFileUrl = async (fileUrl: string) => {
        if (!fileUrl.trim()) {
            setError('Please enter a file URL');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            setStatusMessage('Loading file...');
            setPreviewFiles([]);

            // Check if it's a PDF URL
            if (isPdfUrl(fileUrl)) {
                setStatusMessage('Rendering PDF pages...');
                const renderedPages = await renderPdfUrlToImages(fileUrl);
                setPreviewFiles(renderedPages);
                setStatusMessage('');
            } else {
                // Test if it's an image URL
                const img = new Image();
                img.onload = () => {
                    // Create a mock file object for the image
                    const fileName = fileUrl.split('/').pop()?.split('?')[0] || 'image.jpg';
                    const file = new File([], fileName, { type: 'image/jpeg' });
                    
                    setPreviewFiles([{
                        id: generateId(),
                        previewUrl: fileUrl,
                        file,
                        uploadedUrl: fileUrl, // Add uploadedUrl for URL files
                    }]);
                    setStatusMessage('');
                    setIsLoading(false);
                };
                img.onerror = () => {
                    setError('Could not load image from this URL');
                    setIsLoading(false);
                    setStatusMessage('');
                };
                img.src = fileUrl;
                return; // Early return for images since they're handled asynchronously
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load file from URL');
            setIsLoading(false);
            setStatusMessage('');
        }
    };

    const handleAccept = () => {
        if (previewFiles.length > 0) {
            onFilesReady(previewFiles);
            onOpenChange(false);
            // Reset state
            setUrl('');
            setPreviewFiles([]);
            setError('');
            setStatusMessage('');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset state
        setUrl('');
        setPreviewFiles([]);
        setError('');
        setStatusMessage('');
    };

    return (
        <ConvexDialog.Root isOpen={isOpen} onOpenChange={onOpenChange}>
            <ConvexDialog.Portal>
                <ConvexDialog.Overlay />
                <ConvexDialog.Content>
                    <ConvexDialog.Close iconProps={{ color: 'rgb(246, 238, 219)' }} className='w-10 h-10 bg-accent-hover absolute right-4 top-4 z-10' />
                    <Column>
                        <DialogHeader text='Use File URL' subtext='Enter a direct image or PDF URL to use for your notes pages.' />
                        <Column className='pt-5' gap={3}>
                            <Column gap={1}>
                                <PoppinsText weight='medium'>File URL</PoppinsText>
                                <PoppinsTextInput
                                    value={url}
                                    onChangeText={setUrl}
                                    placeholder='https://example.com/handwritten-notes.jpg or document.pdf'
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    className='w-full border border-subtle-border bg-inner-background p-3'
                                />
                            </Column>

                            {previewFiles.length > 0 && (
                                <Column gap={2}>
                                    <PoppinsText weight='medium'>
                                        Preview {previewFiles.length === 1 ? 'Image' : `(${previewFiles.length} pages)`}
                                    </PoppinsText>
                                    {previewFiles.length === 1 ? (
                                        <div className='w-full h-48 border border-subtle-border bg-inner-background rounded-lg overflow-hidden'>
                                            <img 
                                                src={previewFiles[0].previewUrl} 
                                                alt="Preview" 
                                                className='w-full h-full object-contain'
                                                onError={() => setError('Failed to load preview')}
                                            />
                                        </div>
                                    ) : (
                                        <div className='w-full h-48 border border-subtle-border bg-inner-background rounded-lg overflow-hidden'>
                                            <div className='w-full h-full overflow-x-auto overflow-y-auto p-2'>
                                                <div className='flex gap-2'>
                                                    {previewFiles.map((file, index) => (
                                                        <div key={file.id} className='shrink-0 w-24 h-32 border border-subtle-border rounded overflow-hidden relative'>
                                                            <img 
                                                                src={file.previewUrl} 
                                                                alt={`Page ${index + 1}`} 
                                                                className='w-full h-full object-cover'
                                                                onError={() => setError('Failed to load preview')}
                                                            />
                                                            <div className='absolute bottom-0 left-0 right-0 bg-background/90 text-center py-1'>
                                                                <PoppinsText varient='subtext' className='text-xs'>
                                                                    {index + 1}
                                                                </PoppinsText>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Column>
                            )}

                            {error && (
                                <PoppinsText className='text-red-500'>{error}</PoppinsText>
                            )}

                            {statusMessage && (
                                <PoppinsText className='text-blue-500 text-center'>{statusMessage}</PoppinsText>
                            )}

                            <Row gap={2}>
                                <AppButton 
                                    variant='outline-alt' 
                                    className='h-12 px-4 flex-1' 
                                    onPress={handleClose}
                                >
                                    <PoppinsText weight='medium'>Cancel</PoppinsText>
                                </AppButton>
                                {previewFiles.length === 0 ? (
                                    <AppButton 
                                        variant='green' 
                                        className='h-12 px-4 flex-1' 
                                        onPress={() => checkFileUrl(url)}
                                        disabled={isLoading}
                                    >
                                        <PoppinsText weight='medium' color='white'>
                                            {isLoading ? 'Loading...' : 'Preview'}
                                        </PoppinsText>
                                    </AppButton>
                                ) : (
                                    <AppButton 
                                        variant='green' 
                                        className='h-12 px-4 flex-1' 
                                        onPress={handleAccept}
                                    >
                                        <PoppinsText weight='medium' color='white'>
                                            Accept {previewFiles.length === 1 ? 'Image' : `${previewFiles.length} Pages`}
                                        </PoppinsText>
                                    </AppButton>
                                )}
                            </Row>
                        </Column>
                    </Column>
                </ConvexDialog.Content>
            </ConvexDialog.Portal>
        </ConvexDialog.Root>
    );
};

export default FileUrlModal;
