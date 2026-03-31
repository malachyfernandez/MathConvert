import React, { useState } from 'react';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';

interface ImageUrlModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAccept: (url: string) => void;
}

const ImageUrlModal = ({ isOpen, onOpenChange, onAccept }: ImageUrlModalProps) => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');

    const checkImageUrl = async (imageUrl: string) => {
        if (!imageUrl.trim()) {
            setError('Please enter an image URL');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            
            // Test if the URL loads
            const img = new Image();
            img.onload = () => {
                setPreviewUrl(imageUrl);
                setIsLoading(false);
            };
            img.onerror = () => {
                setError('Could not load image from this URL');
                setIsLoading(false);
            };
            img.src = imageUrl;
        } catch (err) {
            setError('Invalid image URL');
            setIsLoading(false);
        }
    };

    const handleAccept = () => {
        if (previewUrl) {
            onAccept(previewUrl);
            onOpenChange(false);
            // Reset state
            setUrl('');
            setPreviewUrl('');
            setError('');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset state
        setUrl('');
        setPreviewUrl('');
        setError('');
    };

    return (
        <ConvexDialog.Root isOpen={isOpen} onOpenChange={onOpenChange}>
            <ConvexDialog.Portal>
                <ConvexDialog.Overlay />
                <ConvexDialog.Content>
                    <ConvexDialog.Close iconProps={{ color: 'rgb(246, 238, 219)' }} className='w-10 h-10 bg-accent-hover absolute right-4 top-4 z-10' />
                    <Column>
                        <DialogHeader text='Use Image URL' subtext='Enter a direct image URL to use for your notes page.' />
                        <Column className='pt-5' gap={3}>
                            <Column gap={1}>
                                <PoppinsText weight='medium'>Image URL</PoppinsText>
                                <PoppinsTextInput
                                    value={url}
                                    onChangeText={setUrl}
                                    placeholder='https://example.com/handwritten-notes.jpg'
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    className='w-full border border-subtle-border bg-inner-background p-3'
                                />
                            </Column>

                            {previewUrl && (
                                <Column gap={2}>
                                    <PoppinsText weight='medium'>Preview</PoppinsText>
                                    <div className='w-full h-48 border border-subtle-border bg-inner-background rounded-lg overflow-hidden'>
                                        <img 
                                            src={previewUrl} 
                                            alt="Preview" 
                                            className='w-full h-full object-contain'
                                            onError={() => setError('Failed to load preview')}
                                        />
                                    </div>
                                </Column>
                            )}

                            {error && (
                                <PoppinsText className='text-red-500'>{error}</PoppinsText>
                            )}

                            <Row gap={2}>
                                <AppButton 
                                    variant='outline-alt' 
                                    className='h-12 px-4 flex-1' 
                                    onPress={handleClose}
                                >
                                    <PoppinsText weight='medium'>Cancel</PoppinsText>
                                </AppButton>
                                {!previewUrl ? (
                                    <AppButton 
                                        variant='green' 
                                        className='h-12 px-4 flex-1' 
                                        onPress={() => checkImageUrl(url)}
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
                                        <PoppinsText weight='medium' color='white'>Accept</PoppinsText>
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

export default ImageUrlModal;
