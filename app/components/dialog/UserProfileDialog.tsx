import React, { useState } from 'react';
import { View } from 'react-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import { useUserVariable } from 'hooks/useUserVariable';
import { useClerk } from '@clerk/clerk-expo';

interface UserProfileDialogProps {
    children?: React.ReactNode;
}

const UserProfileDialog = ({ children }: UserProfileDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { signOut } = useClerk();
    
    // Get user data from userVariables
    const [userData] = useUserVariable({
        key: 'userData',
        defaultValue: { name: '', email: '', userId: '' },
        privacy: 'PRIVATE'
    });

    // Get/set user-wide AI guidance
    const [aiGuidance, setAiGuidance] = useUserVariable({
        key: 'aiGuidance',
        defaultValue: 'Convert this handwritten math to Markdown + LaTeX with exact transcription.',
        privacy: 'PRIVATE'
    });

    const handleSignOut = () => {
        setIsOpen(false);
        signOut();
    };

    return (
        <ConvexDialog.Root isOpen={isOpen} onOpenChange={setIsOpen}>
            <ConvexDialog.Trigger asChild>
                {children || (
                    <AppButton variant="outline-alt" className="h-14 w-14">
                        <View className="w-6 h-6 bg-gray-400 rounded-full" />
                    </AppButton>
                )}
            </ConvexDialog.Trigger>
            <ConvexDialog.Portal>
                <ConvexDialog.Overlay />
                <ConvexDialog.Content>
                    <ConvexDialog.Close iconProps={{ color: 'rgb(246, 238, 219)' }} className='w-10 h-10 bg-accent-hover absolute right-4 top-4 z-10' />
                    <Column>
                        <DialogHeader text='Profile' subtext='Your account information' />
                        
                        <Column className='pt-5 px-5 pb-5' gap={4}>
                            {/* Profile Info Section */}
                            <Column gap={3}>
                                <PoppinsText className='text-base'>
                                    {userData.value?.name || 'Not set'}
                                </PoppinsText>
                                
                                <PoppinsText className='text-base'>
                                    {userData.value?.email || 'Not available'}
                                </PoppinsText>
                                
                                <PoppinsText varient='subtext' className='text-xs font-mono'>
                                    {userData.value?.userId || 'Not available'}
                                </PoppinsText>
                            </Column>
                            
                            {/* AI Guidance Section */}
                            <Column gap={2}>
                                <PoppinsText weight='medium'>AI Conversion Guidance</PoppinsText>
                                <PoppinsText varient='subtext' className='text-xs'>
                                    Default instructions for AI when converting math images
                                </PoppinsText>
                                <PoppinsTextInput
                                    value={aiGuidance.value}
                                    onChangeText={setAiGuidance}
                                    className='w-full border border-subtle-border bg-inner-background p-3 min-h-20'
                                    multiline={true}
                                    placeholder='Enter guidance for AI conversion...'
                                />
                            </Column>
                            
                            {/* Sign Out Button */}
                            <View className='mt-auto'>
                                <AppButton 
                                    variant='red' 
                                    className='h-12 w-full' 
                                    onPress={handleSignOut}
                                >
                                    <PoppinsText weight='medium' color='red'>
                                        Sign Out
                                    </PoppinsText>
                                </AppButton>
                            </View>
                        </Column>
                    </Column>
                </ConvexDialog.Content>
            </ConvexDialog.Portal>
        </ConvexDialog.Root>
    );
};

export default UserProfileDialog;
