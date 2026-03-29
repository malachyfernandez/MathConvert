import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import PoppinsText from './components/ui/text/PoppinsText';
import DialogOpenDebugHarness from './components/debug/DialogOpenDebugHarness';

const DialogDebugRoute = () => {
    const params = useLocalSearchParams<{ autoOpen?: string; hideModeSelector?: string; mode?: string }>();
    const initialMode = typeof params.mode === 'string' ? params.mode : 'raw-static';
    const autoOpen = params.autoOpen === '1';
    const hideModeSelector = params.hideModeSelector === '1';

    console.log('[dialog-debug-route] render', { autoOpen, hideModeSelector, initialMode });

    return (
        <View className="flex-1 p-8 bg-background">
            <PoppinsText weight="bold" className="text-2xl mb-4 text-center">
                Dialog debug harness
            </PoppinsText>
            <PoppinsText className="text-center text-subtext mb-8">
                Isolated testing for dialog open loop issue
            </PoppinsText>
            <DialogOpenDebugHarness
                autoOpen={autoOpen}
                hideModeSelector={hideModeSelector}
                initialMode={initialMode as any}
            />
        </View>
    );
};

export default DialogDebugRoute;
