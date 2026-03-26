import React, { useState } from 'react';
import Column from '../layout/Column';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import StatusButton from '../ui/StatusButton';
import { MathDocumentPage } from 'types/mathDocuments';

interface EditPageDialogProps {
    page: MathDocumentPage;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (updatedPage: MathDocumentPage) => void;
}

const EditPageDialog = ({ page, isOpen, onOpenChange, onUpdate }: EditPageDialogProps) => {
    const [title, setTitle] = useState(page.title);
    const [initialGuidance, setInitialGuidance] = useState(page.initialGuidance);

    const handleSave = () => {
        const updatedPage: MathDocumentPage = {
            ...page,
            title: title.trim() || page.title,
            initialGuidance: initialGuidance.trim(),
        };
        
        onUpdate(updatedPage);
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
                        <DialogHeader text='Edit page' subtext='Update your page details.' />
                        <Column className='pt-5' gap={3}>
                            <Column gap={1}>
                                <PoppinsText weight='medium'>Page title</PoppinsText>
                                <PoppinsTextInput value={title} onChangeText={setTitle} className='w-full border border-subtle-border bg-inner-background p-3' placeholder='Page title' />
                            </Column>
                            <Column gap={1}>
                                <PoppinsText weight='medium'>Initial guidance</PoppinsText>
                                <PoppinsTextInput
                                    value={initialGuidance}
                                    onChangeText={setInitialGuidance}
                                    className='w-full border border-subtle-border bg-inner-background p-3 min-h-28'
                                    multiline={true}
                                    autoGrow={true}
                                    placeholder='Optional guidance for AI conversion'
                                />
                            </Column>
                            {isValidTitle ? (
                                <AppButton variant='green' className='h-12' onPress={handleSave}>
                                    <PoppinsText weight='medium' color='white'>Save changes</PoppinsText>
                                </AppButton>
                            ) : (
                                <StatusButton 
                                    buttonText="Save changes" 
                                    buttonAltText="Add a title"
                                    className="h-12 w-full"
                                />
                            )}
                        </Column>
                    </Column>
                </ConvexDialog.Content>
            </ConvexDialog.Portal>
        </ConvexDialog.Root>
    );
};

export default EditPageDialog;
