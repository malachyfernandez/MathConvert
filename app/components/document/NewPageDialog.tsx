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
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useGeneration } from '../../../contexts/GenerationContext';
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
    const convertMathImageToMarkdown = useAction(api.mathAi.convertMathImageToMarkdown);
    const { setGeneratingPage, isPageGenerating } = useGeneration();
    const [isOpen, setIsOpen] = useState(false);
    const nextPageNumber = existingPageCount + 1;
    const [title, setTitle] = useState(`Page ${nextPageNumber}`);
    const [imageUrl, setImageUrl] = useState('');
    const [isImageUrlModalOpen, setIsImageUrlModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [createdPage, setCreatedPage] = useState<MathDocumentPage | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

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
            setIsGenerating(false);
            setCreatedPage(null);
            setErrorMessage('');
        }
    }, [isOpen, nextPageNumber]);

    // Ensure modal states are properly closed when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setIsImageUrlModalOpen(false);
            setIsUploading(false);
        }
    }, [isOpen]);

    const handleCreate = async (startGeneration: boolean = false) => {
        const pageId = generateId();
        const newPage: MathDocumentPage = {
            id: pageId,
            documentId,
            pageNumber: nextPageNumber,
            title: title.trim() || `Page ${nextPageNumber}`,
            imageUrl,
            markdown: '',
            initialGuidance: '',
            lastAiPrompt: '',
            followUps: [],
        };

        await setPage({
            key: 'mathDocumentPages',
            itemId: pageId,
            value: newPage,
            privacy: 'PUBLIC',
            filterKey: 'documentId',
            searchKeys: ['title', 'markdown', 'initialGuidance'],
            sortKey: 'pageNumber',
        });

        // Close dialog immediately and navigate to the new page
        setIsOpen(false);
        onCreate(pageId);

        if (startGeneration && imageUrl) {
            // Start generation in the background after dialog is closed
            setCreatedPage(newPage);
            setIsGenerating(true);
            setErrorMessage('');
            
            try {
                setGeneratingPage(pageId, true);

                const result = await convertMathImageToMarkdown({
                    imageUrl: newPage.imageUrl,
                    guidance: 'Convert this handwritten math to LaTeX',
                    currentMarkdown: '',
                });

                const updatedPage: MathDocumentPage = {
                    ...newPage,
                    markdown: result.markdown,
                    lastAiPrompt: 'Convert this handwritten math to LaTeX',
                    lastGeneratedAt: Date.now(),
                };

                await setPage({
                    key: 'mathDocumentPages',
                    itemId: pageId,
                    value: updatedPage,
                    privacy: 'PUBLIC',
                    filterKey: 'documentId',
                    searchKeys: ['title', 'markdown', 'initialGuidance'],
                    sortKey: 'pageNumber',
                });
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'AI conversion failed.');
            } finally {
                setGeneratingPage(pageId, false);
                setIsGenerating(false);
            }
        }
    };

    const getContextualPrompt = () => {
        return 'Convert this handwritten math to LaTeX';
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
                            
                            {/* Blank page option */}
                            <Column className='pt-2 pb-4'>
                                <PoppinsText weight='medium' className='text-center text-text'>
                                    {imageUrl ? 'Blank page (with image)' : 'Blank page'}
                                </PoppinsText>
                            </Column>
                            
                            {/* Buttons */}
                            <Column gap={3}>
                                {isValidTitle && hasImage ? (
                                    <>
                                        <AppButton variant={createButtonVariant} className='h-12' onPress={() => void handleCreate(true)}>
                                            <PoppinsText weight='medium' color='white'>
                                                Create page and start AI conversion
                                            </PoppinsText>
                                        </AppButton>
                                        <AppButton variant='outline-alt' className='h-12' onPress={() => void handleCreate(false)}>
                                            <PoppinsText weight='medium'>
                                                Create blank page
                                            </PoppinsText>
                                        </AppButton>
                                    </>
                                ) : (
                                    <StatusButton 
                                        buttonText="Create page" 
                                        buttonAltText={!hasImage ? "Upload an image first" : "Add a title"}
                                        className="h-12 w-full"
                                    />
                                )}
                            </Column>
                            
                            {errorMessage ? (
                                <PoppinsText className='text-red-500 text-sm text-center'>{errorMessage}</PoppinsText>
                            ) : null}
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
