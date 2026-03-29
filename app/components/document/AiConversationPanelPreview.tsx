import React from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import ChatOptionsDialog from './ChatOptionsDialog';
import { MathDocumentPage } from 'types/mathDocuments';

interface AiConversationPanelPreviewProps {
    onLayout?: (event: LayoutChangeEvent) => void;
}

const AiConversationPanelPreview = ({ onLayout }: AiConversationPanelPreviewProps) => {
    // Create a mock page for the dialog
    const mockPage: MathDocumentPage = {
        id: 'preview',
        documentId: 'preview-doc',
        pageNumber: 1,
        title: 'Preview Page',
        imageUrl: '',
        markdown: '',
        lastAiPrompt: '',
        lastGeneratedAt: undefined,
        followUps: [],
    };

    return (
        <View className='absolute bottom-0 left-0 right-0' onLayout={onLayout}>
            <BlurView 
                intensity={20} 
                tint='light'
                className='absolute bottom-0 left-0 right-0 h-full'
            />
            <View className='relative bg-background/50 border-t border-subtle-border'>
                <Column className='py-4' gap={3}>
                    <Row className='justify-between items-center px-2'>
                        <PoppinsText weight='bold' varient='cardHeader'>Chat with the AI</PoppinsText>
                        <ChatOptionsDialog 
                            followUps={[]} 
                            page={mockPage}
                            onUpdatePage={() => {}}
                            onUpdateMarkdown={() => {}}
                        />
                    </Row>
                    
                    <Column gap={2}>
                        <Row className='' gap={2}>
                            <View className='flex-1 border border-subtle-border bg-background p-3 min-h-32 items-center justify-center'>
                                <PoppinsText className='text-gray-400 text-center'>
                                    AI chat functionality disabled in preview mode
                                </PoppinsText>
                            </View>
                            
                            <View className='w-12 h-12 rounded-lg items-center justify-center bg-gray-400'>
                                <PoppinsText className='text-white text-xs'>OFF</PoppinsText>
                            </View>
                        </Row>
                    </Column>
                </Column>
            </View>
        </View>
    );
};

export default AiConversationPanelPreview;
