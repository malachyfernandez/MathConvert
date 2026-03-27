import React from 'react';
import { View } from 'react-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import AppButton from '../ui/buttons/AppButton';
import StatusButton from '../ui/StatusButton';
import { Tabs } from 'heroui-native';
import { BlurView } from 'expo-blur';

interface DocumentHeaderProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    hasChanges: boolean;
    onSave: () => void;
}

const DocumentHeader = ({ activeTab, onTabChange, hasChanges, onSave }: DocumentHeaderProps) => {
    return (
        <View className='absolute top-0 left-0 right-0 z-10'>
            <BlurView 
                intensity={20} 
                tint='light'
                className='absolute top-0 left-0 right-0 h-full'
            />
            <View className='relative bg-background/50 border-b border-subtle-border'>
                <Column className='p-4' gap={3}>
                    <Row className='justify-between items-center'>
                        <Tabs value={activeTab} onValueChange={onTabChange} variant="secondary" className="flex-1">
                            <Tabs.List>
                                <Tabs.Indicator />
                                <Tabs.Trigger value="editor">
                                    {({ isSelected }) => (
                                        <Tabs.Label className={isSelected ? 'text-black font-medium' : 'text-gray-500'}>
                                            Editor
                                        </Tabs.Label>
                                    )}
                                </Tabs.Trigger>
                                <Tabs.Trigger value="preview">
                                    {({ isSelected }) => (
                                        <Tabs.Label className={isSelected ? 'text-black font-medium' : 'text-gray-500'}>
                                            Preview
                                        </Tabs.Label>
                                    )}
                                </Tabs.Trigger>
                            </Tabs.List>
                        </Tabs>
                        
                        {hasChanges ? (
                            <AppButton variant='green' className='h-10 w-36 ml-4' onPress={onSave}>
                                <PoppinsText weight='medium' color='white'>Save Changes</PoppinsText>
                            </AppButton>
                        ) : (
                            <StatusButton 
                                buttonText="Save Changes" 
                                buttonAltText="No changes"
                                className="h-10 w-36 ml-4"
                            />
                        )}
                    </Row>
                </Column>
            </View>
        </View>
    );
};

export default DocumentHeader;
