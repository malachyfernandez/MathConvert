import React, { useEffect, useState } from 'react';
import Column from '../layout/Column';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import StatusButton from '../ui/StatusButton';
import { useUserListSet } from 'hooks/useUserListSet';
import { useUserListRemove } from 'hooks/useUserListRemove';
import { MathDocument } from 'types/mathDocuments';

interface EditDocumentDialogProps {
    document: MathDocument;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
}

const EditDocumentDialog = ({ document, isOpen, onOpenChange, onDelete }: EditDocumentDialogProps) => {
    const setDocument = useUserListSet<MathDocument>();
    const removeDocument = useUserListRemove();
    const [title, setTitle] = useState(document.title);
    const [description, setDescription] = useState(document.description);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setTitle(document.title);
        setDescription(document.description);
    }, [document, isOpen]);

    const handleSave = async () => {
        await setDocument({
            key: 'mathDocuments',
            itemId: document.id,
            value: {
                ...document,
                title: title.trim() || document.title,
                description: description.trim(),
                lastOpenedAt: document.lastOpenedAt,
            },
            privacy: 'PUBLIC',
            searchKeys: ['title', 'description'],
            sortKey: 'lastOpenedAt',
        });

        onOpenChange(false);
    };

    const handleDelete = async () => {
        await removeDocument({
            key: 'mathDocuments',
            itemId: document.id,
        });
        onDelete();
        onOpenChange(false);
    };

    const isValidTitle = title.trim().length > 0;

    return (
        <ConvexDialog.Root isOpen={isOpen} onOpenChange={onOpenChange}>
            <ConvexDialog.Portal>
                <ConvexDialog.Overlay />
                <ConvexDialog.Content>
                    <ConvexDialog.Close iconProps={{ color: 'rgb(246, 238, 219)' }} className='w-10 h-10 bg-accent-hover absolute right-4 top-4 z-10' />
                    <Column>
                        <DialogHeader text='Edit document' subtext='Update your document details.' />
                        <Column className='pt-5' gap={3}>
                            <Column gap={1}>
                                <PoppinsText weight='medium'>Title</PoppinsText>
                                <PoppinsTextInput value={title} onChangeText={setTitle} className='w-full border border-subtle-border bg-inner-background p-3' placeholder='Document title' />
                            </Column>
                            <Column gap={1}>
                                <PoppinsText weight='medium'>Description</PoppinsText>
                                <PoppinsTextInput
                                    value={description}
                                    onChangeText={setDescription}
                                    className='w-full border border-subtle-border bg-inner-background p-3 min-h-28'
                                    multiline={true}
                                    autoGrow={true}
                                    placeholder='Optional description'
                                />
                            </Column>
                            <Column gap={2}>
                                {isValidTitle ? (
                                    <AppButton variant='black' className='h-12' onPress={() => void handleSave()}>
                                        <PoppinsText weight='medium' color='white'>Save changes</PoppinsText>
                                    </AppButton>
                                ) : (
                                    <StatusButton 
                                        buttonText="Save changes" 
                                        buttonAltText="Add a title"
                                        className="h-12 w-full"
                                    />
                                )}
                                <AppButton variant='red' className='h-12' onPress={handleDelete}>
                                    <PoppinsText weight='medium' color='red'>Delete document</PoppinsText>
                                </AppButton>
                            </Column>
                        </Column>
                    </Column>
                </ConvexDialog.Content>
            </ConvexDialog.Portal>
        </ConvexDialog.Root>
    );
};

export default EditDocumentDialog;
