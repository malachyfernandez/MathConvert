import React, { useState, useRef, useEffect } from 'react';
import { View } from 'react-native';
import { Dialog } from 'heroui-native/dialog';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DocumentHomePage from '../document/DocumentHomePage';
import NewDocumentDialog from '../document/NewDocumentDialog';
import { usePreservedListResults } from '../../../hooks/useListSearch';

type TestMode = 'raw-static' | 'raw-inputs' | 'convex-static' | 'convex-inputs' | 'current' | 'home-page' | 'cache-loop';

const CacheLoopProbe = () => {
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    console.log(`[dialog-debug:cache-loop] render #${renderCountRef.current}`);

    const itemValues = [
        {
            id: 'debug-doc-1',
            title: 'Debug document',
        },
    ];
    const additionalItemValues = [
        [
            {
                id: 'debug-page-1',
                documentId: 'debug-doc-1',
            },
        ],
    ];

    const result = usePreservedListResults({
        additionalItemValues,
        isLoading: false,
        itemValues,
        preserveResultsDuringLoading: true,
    });

    return (
        <Column gap={2}>
            <PoppinsText weight="bold">Cache loop probe</PoppinsText>
            <PoppinsText>items: {result.displayItems?.length ?? 0}</PoppinsText>
            <PoppinsText>additional groups: {result.displayAdditionalItems?.length ?? 0}</PoppinsText>
            <PoppinsText>result count: {result.displayResultCount}</PoppinsText>
        </Column>
    );
};

interface TestComponentProps {
    autoOpen?: boolean;
    mode: TestMode;
}

const TestComponent: React.FC<TestComponentProps> = ({ mode, autoOpen = false }) => {
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;
    
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [mode]);

    useEffect(() => {
        if (!autoOpen) {
            return;
        }

        if (mode === 'current') {
            return;
        }

        console.log(`[dialog-debug:${mode}] auto open requested`);
        setIsOpen(true);
    }, [autoOpen, mode]);
    
    useEffect(() => {
        console.log(`[dialog-debug:${mode}] content mounted`);
        return () => {
            console.log(`[dialog-debug:${mode}] content unmounted`);
        };
    }, []);
    
    console.log(`[dialog-debug:${mode}] render #${renderCountRef.current}`);
    
    const handleTriggerPress = () => {
        console.log(`[dialog-debug:${mode}] trigger press`);
    };
    
    const handleOpenChange = (open: boolean) => {
        console.log(`[dialog-debug:${mode}] onOpenChange ${open}`);
        setIsOpen(open);
    };
    
    if (mode === 'raw-static') {
        return (
            <Dialog isOpen={isOpen} onOpenChange={handleOpenChange}>
                <Dialog.Trigger asChild>
                    <AppButton onPress={handleTriggerPress} className="h-12 px-5">
                        <PoppinsText weight="medium" color="white">Open Raw Static Dialog</PoppinsText>
                    </AppButton>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay />
                    <Dialog.Content className="bg-background rounded border-2 border-border max-w-2xl w-full mx-auto p-6">
                        <PoppinsText weight="bold" className="text-xl mb-4">Raw Static Dialog</PoppinsText>
                        <PoppinsText>This is a static dialog with no inputs, testing raw HeroUI dialog behavior.</PoppinsText>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>
        );
    }
    
    if (mode === 'raw-inputs') {
        return (
            <Dialog isOpen={isOpen} onOpenChange={handleOpenChange}>
                <Dialog.Trigger asChild>
                    <AppButton onPress={handleTriggerPress} className="h-12 px-5">
                        <PoppinsText weight="medium" color="white">Open Raw Inputs Dialog</PoppinsText>
                    </AppButton>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay />
                    <Dialog.Content className="bg-background rounded border-2 border-border max-w-2xl w-full mx-auto p-6">
                        <Column gap={4}>
                            <PoppinsText weight="bold" className="text-xl">Raw Inputs Dialog</PoppinsText>
                            <Column gap={2}>
                                <PoppinsText weight="medium">Title</PoppinsText>
                                <PoppinsTextInput 
                                    value="" 
                                    onChangeText={() => {}} 
                                    className="w-full border border-subtle-border bg-inner-background p-3" 
                                    placeholder="Document title" 
                                />
                            </Column>
                            <Column gap={2}>
                                <PoppinsText weight="medium">Description</PoppinsText>
                                <PoppinsTextInput
                                    value=""
                                    onChangeText={() => {}}
                                    className="w-full border border-subtle-border bg-inner-background p-3 min-h-28"
                                    multiline={true}
                                    placeholder="Optional description"
                                />
                            </Column>
                            <PoppinsText className="text-subtext">No submit logic - just testing inputs</PoppinsText>
                        </Column>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>
        );
    }
    
    if (mode === 'convex-static') {
        return (
            <ConvexDialog.Root isOpen={isOpen} onOpenChange={handleOpenChange}>
                <ConvexDialog.Trigger asChild>
                    <AppButton onPress={handleTriggerPress} className="h-12 px-5">
                        <PoppinsText weight="medium" color="white">Open Convex Static Dialog</PoppinsText>
                    </AppButton>
                </ConvexDialog.Trigger>
                <ConvexDialog.Portal>
                    <ConvexDialog.Overlay />
                    <ConvexDialog.Content className="bg-background rounded border-2 border-border max-w-2xl w-full mx-auto p-6">
                        <PoppinsText weight="bold" className="text-xl mb-4">Convex Static Dialog</PoppinsText>
                        <PoppinsText>This is a static dialog using ConvexDialog wrapper with no inputs.</PoppinsText>
                    </ConvexDialog.Content>
                </ConvexDialog.Portal>
            </ConvexDialog.Root>
        );
    }
    
    if (mode === 'convex-inputs') {
        return (
            <ConvexDialog.Root isOpen={isOpen} onOpenChange={handleOpenChange}>
                <ConvexDialog.Trigger asChild>
                    <AppButton onPress={handleTriggerPress} className="h-12 px-5">
                        <PoppinsText weight="medium" color="white">Open Convex Inputs Dialog</PoppinsText>
                    </AppButton>
                </ConvexDialog.Trigger>
                <ConvexDialog.Portal>
                    <ConvexDialog.Overlay />
                    <ConvexDialog.Content className="bg-background rounded border-2 border-border max-w-2xl w-full mx-auto p-6">
                        <Column gap={4}>
                            <PoppinsText weight="bold" className="text-xl">Convex Inputs Dialog</PoppinsText>
                            <Column gap={2}>
                                <PoppinsText weight="medium">Title</PoppinsText>
                                <PoppinsTextInput 
                                    value="" 
                                    onChangeText={() => {}} 
                                    className="w-full border border-subtle-border bg-inner-background p-3" 
                                    placeholder="Document title" 
                                />
                            </Column>
                            <Column gap={2}>
                                <PoppinsText weight="medium">Description</PoppinsText>
                                <PoppinsTextInput
                                    value=""
                                    onChangeText={() => {}}
                                    className="w-full border border-subtle-border bg-inner-background p-3 min-h-28"
                                    multiline={true}
                                    placeholder="Optional description"
                                />
                            </Column>
                            <PoppinsText className="text-subtext">No submit logic - just testing ConvexDialog with inputs</PoppinsText>
                        </Column>
                    </ConvexDialog.Content>
                </ConvexDialog.Portal>
            </ConvexDialog.Root>
        );
    }
    
    if (mode === 'current') {
        return (
            <NewDocumentDialog onCreate={() => console.log('[debug] onCreate called')} />
        );
    }

    if (mode === 'home-page') {
        return (
            <DocumentHomePage
                userId="debug-user"
                setActiveDocumentId={(documentId) => {
                    console.log('[dialog-debug:home-page] setActiveDocumentId', documentId);
                }}
            />
        );
    }

    if (mode === 'cache-loop') {
        return <CacheLoopProbe />;
    }
    
    return null;
};

interface DialogOpenDebugHarnessProps {
    autoOpen?: boolean;
    hideModeSelector?: boolean;
    initialMode?: TestMode;
}

const DialogOpenDebugHarness: React.FC<DialogOpenDebugHarnessProps> = ({
    autoOpen = false,
    hideModeSelector = false,
    initialMode = 'raw-static',
}) => {
    const [currentMode, setCurrentMode] = useState<TestMode>(initialMode);

    useEffect(() => {
        setCurrentMode(initialMode);
    }, [initialMode]);
    
    const modes: TestMode[] = ['raw-static', 'raw-inputs', 'convex-static', 'convex-inputs', 'current', 'home-page', 'cache-loop'];
    
    return (
        <Column className="flex-1" gap={6}>
            <Column gap={2}>
                <PoppinsText weight="bold" className="text-lg">Current Mode: {currentMode}</PoppinsText>
                <PoppinsText className="text-subtext">Click each mode to test dialog behavior</PoppinsText>
            </Column>
            
            {hideModeSelector ? null : (
                <Row className="flex-wrap gap-2">
                    {modes.map((mode) => (
                        <AppButton
                            key={mode}
                            variant={currentMode === mode ? 'green' : 'outline-alt'}
                            className="h-10 px-4"
                            onPress={() => {
                                console.log(`[dialog-debug] switching to mode: ${mode}`);
                                setCurrentMode(mode);
                            }}
                        >
                            <PoppinsText weight="medium" color={currentMode === mode ? "white" : undefined}>
                                {mode}
                            </PoppinsText>
                        </AppButton>
                    ))}
                </Row>
            )}
            
            <Column className="flex-1 items-center justify-center p-8 border border-subtle-border rounded-xl bg-inner-background">
                <TestComponent autoOpen={autoOpen} mode={currentMode} />
            </Column>
        </Column>
    );
};

export default DialogOpenDebugHarness;
