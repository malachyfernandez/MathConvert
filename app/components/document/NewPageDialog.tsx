import React, { useState, useEffect } from 'react';
import { Image, ActivityIndicator, View } from 'react-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import StatusButton from '../ui/StatusButton';
import SimpleImageUpload from './SimpleImageUpload';
import ImageUrlModal from './ImageUrlModal';
import { useUserListSet } from 'hooks/useUserListSet';
import { MathDocumentPage } from 'types/mathDocuments';
import { generateId } from 'utils/generateId';

interface NewPageDialogProps {
    documentId: string;
    existingPageCount: number;
    onCreate: (pageId: string) => void;
    triggerButtonVariant?: 'black' | 'green';
    createButtonVariant?: 'black' | 'green';
}

const NewPageDialog = ({ documentId, existingPageCount, onCreate, triggerButtonVariant = 'green', createButtonVariant = 'green' }: NewPageDialogProps) => {
    const setPage = useUserListSet<MathDocumentPage>();
    const [isOpen, setIsOpen] = useState(false);
    const nextPageNumber = existingPageCount + 1;
    const [title, setTitle] = useState(`Page ${nextPageNumber}`);
    const [imageUrl, setImageUrl] = useState('');
    const [isImageUrlModalOpen, setIsImageUrlModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUrlAccept = (url: string) => {
        setImageUrl(url);
    };

    // Reset state when dialog opens
    useEffect(() => {
        if (isOpen) {
            setTitle(`Page ${nextPageNumber}`);
            setImageUrl('');
            setIsImageUrlModalOpen(false);
            setIsUploading(false);
        }
    }, [isOpen, nextPageNumber]);

    // Ensure modal states are properly closed when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setIsImageUrlModalOpen(false);
            setIsUploading(false);
        }
    }, [isOpen]);

    const handleCreate = async () => {
        const pageId = generateId();

        await setPage({
            key: 'mathDocumentPages',
            itemId: pageId,
            value: {
                id: pageId,
                documentId,
                pageNumber: nextPageNumber,
                title: title.trim() || `Page ${nextPageNumber}`,
                imageUrl,
                markdown: '',
                initialGuidance: '',
                lastAiPrompt: '',
                followUps: [],
            },
            privacy: 'PUBLIC',
            filterKey: 'documentId',
            searchKeys: ['title', 'markdown', 'initialGuidance'],
            sortKey: 'pageNumber',
        });

        setIsOpen(false);
        onCreate(pageId);
    };

    const isValidTitle = title.trim().length > 0;
    const hasImage = imageUrl.trim().length > 0;
    const canCreate = isValidTitle && hasImage;

    return (
        <ConvexDialog.Root isOpen={isOpen} onOpenChange={setIsOpen}>
            <ConvexDialog.Trigger asChild>
                <AppButton variant={triggerButtonVariant} className='h-12 px-5'>
                    <PoppinsText weight='medium' color='white'>Add page</PoppinsText>
                </AppButton>
            </ConvexDialog.Trigger>
            <ConvexDialog.Portal>
                <ConvexDialog.Overlay />
                <ConvexDialog.Content>
                    <ConvexDialog.Close iconProps={{ color: 'rgb(246, 238, 219)' }} className='w-10 h-10 bg-accent-hover absolute right-4 top-4 z-10' />
                    <Column>
                        <DialogHeader text='Add page' subtext='Create a new page for your document.' />
                        <Column className='pt-5' gap={4}>
                            <Column gap={1}>
                                <PoppinsText weight='medium'>Page title</PoppinsText>
                                <PoppinsTextInput value={title} onChangeText={setTitle} className='w-full border border-subtle-border bg-inner-background p-3' placeholder={`Page ${nextPageNumber}`} />
                            </Column>
                            
                            <Column gap={1}>
                                <PoppinsText weight='medium'>Math image</PoppinsText>
                                
                                <View className='w-full h-56 overflow-hidden rounded-lg border border-subtle-border bg-background relative'>
                                    {imageUrl ? (
                                        <>
                                            <Image
                                                source={{ uri: imageUrl }}
                                                className='w-full h-full'
                                                resizeMode='contain'
                                            />
                                            <View className='absolute bottom-0 left-0 right-0 p-4 pt-12 bg-linear-to-t from-background to-transparent'>
                                                <PoppinsText varient='subtext' className='text-xs mb-2 text-center'>
                                                    {imageUrl}
                                                </PoppinsText>
                                                <Row gap={2}>
                                                    <View className='flex-1'>
                                                        <AppButton
                                                            variant='outline-alt'
                                                            className='h-12 w-full'
                                                            onPress={() => setIsImageUrlModalOpen(true)}
                                                        >
                                                            <PoppinsText weight='medium'>Use Image URL</PoppinsText>
                                                        </AppButton>
                                                    </View>
                                                    <View className='flex-1'>
                                                        <SimpleImageUpload
                                                            url={imageUrl}
                                                            setUrl={setImageUrl}
                                                            buttonLabel='Change Image'
                                                            emptyLabel='Upload page image'
                                                            className='w-full'
                                                        />
                                                    </View>
                                                </Row>
                                            </View>
                                        </>
                                    ) : (
                                        <Column className='flex-1 items-center justify-center p-4'>
                                            <PoppinsText varient='subtext' className='text-center mb-4'>Upload a math image to get started</PoppinsText>
                                            <Row gap={2}>
                                                <AppButton 
                                                    variant='outline-alt' 
                                                    className='h-12 px-5' 
                                                    onPress={() => setIsImageUrlModalOpen(true)}
                                                >
                                                    <PoppinsText weight='medium'>Use Image URL</PoppinsText>
                                                </AppButton>
                                                <SimpleImageUpload
                                                    url={imageUrl}
                                                    setUrl={setImageUrl}
                                                    buttonLabel='Upload Image'
                                                    emptyLabel='Upload page image'
                                                    className='flex-1'
                                                />
                                            </Row>
                                        </Column>
                                    )}
                                </View>
                            </Column>
                            
                            {canCreate ? (
                                <AppButton variant={createButtonVariant} className='h-12' onPress={() => void handleCreate()}>
                                    <PoppinsText weight='medium' color='white'>
                                        {isUploading ? <ActivityIndicator color='white' /> : 'Create page'}
                                    </PoppinsText>
                                </AppButton>
                            ) : (
                                <StatusButton 
                                    buttonText="Create page" 
                                    buttonAltText={!hasImage ? "Upload an image first" : "Add a title"}
                                    className="h-12 w-full"
                                />
                            )}
                        </Column>
                    </Column>
                </ConvexDialog.Content>
            </ConvexDialog.Portal>
            
            <ImageUrlModal
                isOpen={isImageUrlModalOpen}
                onOpenChange={setIsImageUrlModalOpen}
                onAccept={handleImageUrlAccept}
            />
        </ConvexDialog.Root>
    );
};

export default NewPageDialog;
