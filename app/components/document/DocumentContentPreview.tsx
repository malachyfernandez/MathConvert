import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, {
    FadeInUp,
    FadeOutDown,
    FadeInDown,
    FadeOutUp,
} from 'react-native-reanimated';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import { Tabs } from 'heroui-native';
import { MathDocumentPage } from 'types/mathDocuments';
import DocumentHeaderPreview from './DocumentHeaderPreview';
import ContentEditorPreview from './ContentEditorPreview';
import ContentPreview from './ContentPreview';
import AiConversationPanelPreview from './AiConversationPanelPreview';

interface DocumentContentPreviewProps {
    documentId: string;
    activePage: MathDocumentPage;
    text: string;
}

const DocumentContentPreview = ({ documentId, activePage, text }: DocumentContentPreviewProps) => {
    const [activeTab, setActiveTab] = useState('preview');
    const [headerHeight, setHeaderHeight] = useState(0);
    const [footerHeight, setFooterHeight] = useState(0);

    const handleHeaderLayout = (event: LayoutChangeEvent) => {
        setHeaderHeight(event.nativeEvent.layout.height);
    };

    const handleFooterLayout = (event: LayoutChangeEvent) => {
        setFooterHeight(event.nativeEvent.layout.height);
    };

    return (
        <View className='flex-1'>
            {/* Sticky Header with Tabs */}
            <DocumentHeaderPreview
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLayout={handleHeaderLayout}
            />

            {/* Scrollable Content Section */}
            <View className='flex-1'>
                <Column gap={4} className='flex-1'>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                        <Tabs.Content value="editor" className='flex-1' style={{ minHeight: 0 }}>

                            <Animated.View
                                entering={FadeInDown.duration(300).springify()}
                                exiting={FadeOutDown.duration(300).springify()}
                                className='flex-1'
                            >
                                <View className='flex-1' style={{ minHeight: 0 }}>
                                    <ContentEditorPreview
                                        text={text}
                                        headerHeight={headerHeight}
                                        footerHeight={footerHeight}
                                    />
                                </View>
                            </Animated.View>


                        </Tabs.Content>

                        <Tabs.Content value="preview" className='flex-1' style={{ minHeight: 0 }}>

                            <Animated.View
                                entering={FadeInDown.duration(300).springify()}
                                className='flex-1'
                            >
                                <View className='flex-1' style={{ minHeight: 0 }}>
                                    <ContentPreview markdown={text} headerHeight={headerHeight} footerHeight={footerHeight} />
                                </View>
                            </Animated.View>

                        </Tabs.Content>
                    </Tabs>

                </Column>
            </View>

            {/* Static AI Section */}
            <AiConversationPanelPreview
                onLayout={handleFooterLayout}
            />
        </View >
    );
};

export default DocumentContentPreview;
