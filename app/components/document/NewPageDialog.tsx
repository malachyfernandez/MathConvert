import React, { useEffect, useState } from 'react';
import Column from '../layout/Column';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import { useUserListSet } from 'hooks/useUserListSet';
import { MathDocumentPage } from 'types/mathDocuments';
import { generateId } from 'utils/generateId';

interface NewPageDialogProps {
    documentId: string;
    existingPageCount: number;
    onCreate: (pageId: string) => void;
}

const NewPageDialog = ({ documentId, existingPageCount, onCreate }: NewPageDialogProps) => {
    const setPage = useUserListSet<MathDocumentPage>();
    const [isOpen, setIsOpen] = useState(false);
    const nextPageNumber = existingPageCount + 1;
    const [title, setTitle] = useState(`Page ${nextPageNumber}`);

    useEffect(() => {
        if (!isOpen) {
            setTitle(`Page ${nextPageNumber}`);
        }
    }, [isOpen, nextPageNumber]);

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
                imageUrl: '',
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

    return (
        <ConvexDialog.Root isOpen={isOpen} onOpenChange={setIsOpen}>
            <ConvexDialog.Trigger asChild>
                <AppButton variant='green' className='h-12 px-5'>
                    <PoppinsText weight='medium' color='white'>Add page</PoppinsText>
                </AppButton>
            </ConvexDialog.Trigger>
            <ConvexDialog.Portal>
                <ConvexDialog.Overlay />
                <ConvexDialog.Content>
                    <ConvexDialog.Close iconProps={{ color: 'rgb(246, 238, 219)' }} className='w-10 h-10 bg-accent-hover absolute right-4 top-4 z-10' />
                    <Column>
                        <DialogHeader text='Add page' subtext='Each page is a separate image and AI conversion request.' />
                        <Column className='pt-5' gap={3}>
                            <Column gap={1}>
                                <PoppinsText weight='medium'>Page title</PoppinsText>
                                <PoppinsTextInput value={title} onChangeText={setTitle} className='w-full border border-subtle-border bg-inner-background p-3' />
                            </Column>
                            <AppButton variant='green' className='h-12' onPress={() => void handleCreate()}>
                                <PoppinsText weight='medium' color='white'>Create page</PoppinsText>
                            </AppButton>
                        </Column>
                    </Column>
                </ConvexDialog.Content>
            </ConvexDialog.Portal>
        </ConvexDialog.Root>
    );
};

export default NewPageDialog;
