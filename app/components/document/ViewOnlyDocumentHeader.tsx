import React from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Tabs } from 'heroui-native';
import { BlurView } from 'expo-blur';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import AppButton from '../ui/buttons/AppButton';

export type ViewOnlyTab = 'screenReadable' | 'imageOverlay';

interface ViewOnlyDocumentHeaderProps {
    activeTab: ViewOnlyTab;
    documentTitle: string;
    documentDescription: string;
    pageCount: number;
    onDownloadPdf: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    zoomLevel: number;
    onLayout?: (event: LayoutChangeEvent) => void;
    onTabChange: (tab: ViewOnlyTab) => void;
}

const ViewOnlyDocumentHeader = ({
    activeTab,
    documentTitle,
    documentDescription,
    pageCount,
    onDownloadPdf,
    onZoomIn,
    onZoomOut,
    zoomLevel,
    onLayout,
    onTabChange,
}: ViewOnlyDocumentHeaderProps) => {
    const secondaryText = documentDescription || `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`;

    return (
        <View className='absolute top-0 left-0 right-0 z-10' onLayout={onLayout}>
            <BlurView
                intensity={20}
                tint='light'
                className='absolute top-0 left-0 right-0 h-full'
            />
            <View className='relative border-b border-subtle-border bg-background/50'>
                <Column className='p-4' gap={3}>
                    <Column gap={0}>
                        <PoppinsText weight='bold' className='text-lg'>
                            {documentTitle || 'Untitled math document'}
                        </PoppinsText>
                        <PoppinsText varient='subtext'>{secondaryText}</PoppinsText>
                    </Column>
                    <Row className='items-center justify-between' gap={3}>
                        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as ViewOnlyTab)} variant='secondary' className='flex-1'>
                            <Tabs.List>
                                <Tabs.Indicator />
                                <Tabs.Trigger value='screenReadable'>
                                    {({ isSelected }) => (
                                        <Tabs.Label className={isSelected ? 'font-medium text-black' : 'text-gray-500'}>
                                            Screen Readable
                                        </Tabs.Label>
                                    )}
                                </Tabs.Trigger>
                                <Tabs.Trigger value='imageOverlay'>
                                    {({ isSelected }) => (
                                        <Tabs.Label className={isSelected ? 'font-medium text-black' : 'text-gray-500'}>
                                            Image View
                                        </Tabs.Label>
                                    )}
                                </Tabs.Trigger>
                            </Tabs.List>
                        </Tabs>
                        
                        <Row gap={2} className='items-center'>
                            <Row gap={1} className='items-center bg-inner-background rounded-lg px-1 py-1'>
                                <AppButton 
                                    variant='outline' 
                                    className='h-8 w-8 p-0' 
                                    onPress={onZoomOut}
                                    disabled={zoomLevel <= 0.5}
                                >
                                    <PoppinsText weight='medium' className='text-sm'>−</PoppinsText>
                                </AppButton>
                                
                                <PoppinsText className='text-xs px-2 min-w-12 text-center'>
                                    {Math.round(zoomLevel * 100)}%
                                </PoppinsText>
                                
                                <AppButton 
                                    variant='outline' 
                                    className='h-8 w-8 p-0' 
                                    onPress={onZoomIn}
                                    disabled={zoomLevel >= 2}
                                >
                                    <PoppinsText weight='medium' className='text-sm'>+</PoppinsText>
                                </AppButton>
                            </Row>
                            
                            <AppButton variant='green' className='h-10 px-4' onPress={onDownloadPdf}>
                                <PoppinsText weight='medium' color='white'>Download PDF</PoppinsText>
                            </AppButton>
                        </Row>
                    </Row>
                </Column>
            </View>
        </View>
    );
};

export default ViewOnlyDocumentHeader;
