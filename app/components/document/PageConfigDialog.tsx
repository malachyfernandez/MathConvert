import React, { useEffect, useState } from 'react';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import StatusButton from '../ui/StatusButton';
import { MathDocumentPage } from 'types/mathDocuments';

interface PageConfigDialogProps {
    page: MathDocumentPage;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (updatedPage: MathDocumentPage) => void;
    onDelete: () => void;
}

const PageConfigDialog = ({ page, isOpen, onOpenChange, onUpdate, onDelete }: PageConfigDialogProps) => {
    const [title, setTitle] = useState(page.title);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setTitle(page.title);
    }, [isOpen, page]);

    const handleSave = () => {
        const updatedPage: MathDocumentPage = {
            ...page,
            title: title.trim() || page.title,
        };

        onUpdate(updatedPage);
        onOpenChange(false);
    };

    const handleDelete = () => {
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
                        <DialogHeader text='Page settings' subtext='Configure your page details.' />
                        <Column className='pt-5' gap={3}>
                            <Column gap={1}>
                                <PoppinsText weight='medium'>Page title</PoppinsText>
                                <PoppinsTextInput value={title} onChangeText={setTitle} className='w-full border border-subtle-border bg-inner-background p-3' placeholder='Page title' />
                            </Column>

                            <Column gap={2}>
                                {isValidTitle ? (
                                    <AppButton variant='black' className='h-12' onPress={handleSave}>
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
                                    <PoppinsText weight='medium' color='red'>Delete page</PoppinsText>
                                </AppButton>
                            </Column>
                        </Column>
                    </Column>
                </ConvexDialog.Content>
            </ConvexDialog.Portal>
        </ConvexDialog.Root>
    );
};

export default PageConfigDialog;
