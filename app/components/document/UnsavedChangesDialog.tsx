import React from 'react';
import Column from '../layout/Column';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import Row from '../layout/Row';

interface UnsavedChangesDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmDiscard: () => void;
}

const UnsavedChangesDialog = ({ isOpen, onOpenChange, onConfirmDiscard }: UnsavedChangesDialogProps) => {
    const handleKeepEditing = () => {
        onOpenChange(false);
    };

    return (
        <ConvexDialog.Root isOpen={isOpen} onOpenChange={onOpenChange}>
            <ConvexDialog.Portal>
                <ConvexDialog.Overlay />
                <ConvexDialog.Content >
                    <Column className='h-full'>
                        <DialogHeader text='Unsaved changes' subtext='Are you sure you dont want to save the ordering?' />
                        <Column className='pt-5 flex-1 justify-center'>
                            <PoppinsText className='text-center text-text'>
                                You have reordered pages but haven't saved your changes.
                            </PoppinsText>
                        </Column>
                        <Row className='pt-4 gap-3 w-full'>
                            <AppButton variant='red' className='h-12 flex-1' onPress={onConfirmDiscard}>
                                <PoppinsText weight='medium' color='red'>Discard Changes</PoppinsText>
                            </AppButton>
                            <AppButton variant='black' className='h-12 flex-1' onPress={handleKeepEditing}>
                                <PoppinsText weight='medium' color='white'>Keep Editing</PoppinsText>
                            </AppButton>

                        </Row>
                    </Column>
                </ConvexDialog.Content>
            </ConvexDialog.Portal>
        </ConvexDialog.Root>
    );
};

export default UnsavedChangesDialog;
