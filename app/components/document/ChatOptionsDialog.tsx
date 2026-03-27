import React, { useState } from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import AppButton from '../ui/buttons/AppButton';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import { MonoIconsOptionsHorizontal } from '../icons/MonoIconsOptionsHorizontal';
import { MathDocumentPage } from 'types/mathDocuments';
import { useMathGeneration } from 'hooks/useMathGeneration';

interface ChatOptionsDialogProps {
    followUps: MathDocumentPage['followUps'];
    page: MathDocumentPage;
    onUpdatePage: (nextPage: MathDocumentPage, description: string) => void;
    onUpdateMarkdown: (markdown: string) => void;
}

const ChatOptionsDialog = ({ followUps, page, onUpdatePage, onUpdateMarkdown }: ChatOptionsDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isGenerating, errorMessage, handleInitialGeneration, setErrorMessage } = useMathGeneration({
        page,
        onUpdatePage,
        onUpdateMarkdown,
    });

    const handleRegenerate = async () => {
        await handleInitialGeneration();
        setIsOpen(false);
    };

    return (
        <ConvexDialog.Root isOpen={isOpen} onOpenChange={setIsOpen}>
            <ConvexDialog.Trigger asChild>
                <Pressable onPress={() => setIsOpen(true)}>
                    <MonoIconsOptionsHorizontal width={20} height={20} className="text-gray-600" />
                </Pressable>
            </ConvexDialog.Trigger>
            <ConvexDialog.Portal>
                <ConvexDialog.Overlay />
                <ConvexDialog.Content>
                    <ConvexDialog.Close iconProps={{ color: 'rgb(246, 238, 219)' }} className='w-10 h-10 bg-accent-hover absolute right-4 top-4 z-10' />
                    <Column>
                        <DialogHeader text='Chat Options' subtext='Manage your AI conversation and regenerate responses.' />
                        <Column className='pt-5' gap={6}>
                            <AppButton
                                variant='green'
                                className={`h-12 ${isGenerating ? 'opacity-50' : ''}`}
                                onPress={isGenerating ? undefined : handleRegenerate}
                            >
                                <PoppinsText weight='medium' color='white'>
                                    {isGenerating ? <ActivityIndicator color='white' /> : 'Regenerate from scratch'}
                                </PoppinsText>
                            </AppButton>

                            {errorMessage ? <PoppinsText className='text-red-500 text-center'>{errorMessage}</PoppinsText> : null}
                            <Column gap={2}>
                                {followUps.length > 0 && (
                                    <PoppinsText weight='medium' varient='cardHeader' className='ml-2'>Chat History</PoppinsText>
                                )}

                                {followUps.length === 0 ? (
                                    <Column className='items-center justify-center py-8'>
                                        <PoppinsText varient='subtext' className='text-center'>
                                            No previous follow-ups yet
                                        </PoppinsText>
                                    </Column>
                                ) : (
                                    <Column gap={3}>
                                        {followUps.slice().reverse().map((followUp) => (
                                            <Column key={followUp.id} className='rounded-xl border border-subtle-border bg-background p-4' gap={2}>
                                                <PoppinsText weight='medium'>{followUp.prompt}</PoppinsText>
                                                <PoppinsText varient='subtext' className='text-xs'>
                                                    {new Date(followUp.createdAt).toLocaleString()}
                                                </PoppinsText>
                                            </Column>
                                        ))}
                                    </Column>
                                )}
                            </Column>
                        </Column>
                    </Column>
                </ConvexDialog.Content>
            </ConvexDialog.Portal>
        </ConvexDialog.Root>
    );
};

export default ChatOptionsDialog;
