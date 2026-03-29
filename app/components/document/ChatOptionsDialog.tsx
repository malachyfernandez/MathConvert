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
import { generateId } from 'utils/generateId';

interface ChatOptionsDialogProps {
    followUps: MathDocumentPage['followUps'];
    page: MathDocumentPage;
    onUpdatePage: (nextPage: MathDocumentPage, description: string) => void;
    onUpdateMarkdown: (markdown: string) => void;
}

const ChatOptionsDialog = ({ followUps, page, onUpdatePage, onUpdateMarkdown }: ChatOptionsDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [regenerationFollowUpId, setRegenerationFollowUpId] = useState<string | null>(null);
    const [currentFollowUps, setCurrentFollowUps] = useState(followUps);
    
    // Update current follow-ups when props change
    React.useEffect(() => {
        setCurrentFollowUps(followUps);
    }, [followUps]);
    
    const { isGenerating, errorMessage, handleInitialGeneration, setErrorMessage } = useMathGeneration({
        page,
        onUpdatePage,
        onUpdateMarkdown,
        onFollowUpUpdate: (followUpId: string, resultingMarkdown: string) => {
            if (followUpId === regenerationFollowUpId) {
                // Update the follow-up with the resulting markdown
                const updatedFollowUps = currentFollowUps.map(followUp => 
                    followUp.id === followUpId 
                        ? { ...followUp, resultingMarkdown }
                        : followUp
                );
                setCurrentFollowUps(updatedFollowUps);
                const updatedPage = { ...page, followUps: updatedFollowUps };
                onUpdatePage(updatedPage, 'Updated regeneration follow-up with result');
            }
        },
    });

    const handleRegenerate = async () => {
        // Clear the editor first
        onUpdateMarkdown('');
        
        // Add regeneration to follow-up history
        const regenerationFollowUp = {
            id: generateId(),
            prompt: 'Regenerated from scratch',
            createdAt: Date.now(),
            resultingMarkdown: '', // Will be updated after generation
        };
        setRegenerationFollowUpId(regenerationFollowUp.id);

        // Update page with new follow-up and cleared markdown
        const pageWithFollowUp = {
            ...page,
            markdown: '',
            followUps: [...currentFollowUps, regenerationFollowUp],
        };
        setCurrentFollowUps([...currentFollowUps, regenerationFollowUp]);
        onUpdatePage(pageWithFollowUp, 'Added regeneration to follow-up history');

        // Perform regeneration with cleared markdown
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
                                variant='black'
                                className={`h-12 ${isGenerating ? 'opacity-50' : ''}`}
                                onPress={isGenerating ? undefined : handleRegenerate}
                            >
                                <PoppinsText weight='medium' color='white'>
                                    {isGenerating ? <ActivityIndicator color='white' /> : 'Regenerate from scratch'}
                                </PoppinsText>
                            </AppButton>

                            {errorMessage ? <PoppinsText className='text-red-500 text-center'>{errorMessage}</PoppinsText> : null}
                            <Column gap={2}>
                                {currentFollowUps.length > 0 && (
                                    <PoppinsText weight='medium' varient='cardHeader' className='ml-2'>Chat History</PoppinsText>
                                )}

                                {currentFollowUps.length === 0 ? (
                                    <Column className='items-center justify-center py-8'>
                                        <PoppinsText varient='subtext' className='text-center'>
                                            No previous follow-ups yet
                                        </PoppinsText>
                                    </Column>
                                ) : (
                                    <Column gap={3}>
                                        {currentFollowUps.slice().reverse().map((followUp) => (
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
