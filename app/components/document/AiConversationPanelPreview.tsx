import React from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import AppButton from '../ui/buttons/AppButton';

interface AiConversationPanelPreviewProps {
    onLayout?: (event: LayoutChangeEvent) => void;
    onKeep: () => void;
    onDiscard: () => void;
}

const AiConversationPanelPreview = ({ onLayout, onKeep, onDiscard }: AiConversationPanelPreviewProps) => {
    return (
        <View className='absolute bottom-0 left-0 right-0' onLayout={onLayout}>
            <BlurView
                intensity={20}
                tint='light'
                className='absolute bottom-0 left-0 right-0 h-full'
            />
            <View className='relative bg-background/50 border-t border-subtle-border'>
                <Column className='py-4' gap={3}>
                    <Row className='justify-between items-center'>
                        <PoppinsText weight='bold' varient='cardHeader'>Preview Options</PoppinsText>
                    </Row>

                    <Column gap={2}>
                        <Row className='justify-between items-center' gap={3}>
                            <AppButton
                                variant='outline-alt'
                                className='flex-1 h-12'
                                onPress={onDiscard}
                            >
                                <PoppinsText weight='medium'>Discard</PoppinsText>
                            </AppButton>
                            <AppButton
                                variant='green'
                                className='flex-1 h-12'
                                onPress={onKeep}
                            >
                                <PoppinsText weight='medium' color='white'>Replace</PoppinsText>
                            </AppButton>


                        </Row>
                    </Column>
                </Column>
            </View>
        </View>
    );
};

export default AiConversationPanelPreview;
