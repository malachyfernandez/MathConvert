import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    FadeInUp,
    FadeInDown,
    Easing,
} from 'react-native-reanimated';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { useUserVariable } from 'hooks/useUserVariable';
import { MathDocument, MathDocumentPage } from 'types/mathDocuments';
import DocumentSidebar from './DocumentSidebar';
import DocumentEditor from './DocumentEditor';
import NewPageDialog from './NewPageDialog';
import { useUserListGet } from 'hooks/useUserListGet';

interface DocumentEditorPageProps {
    documentId: string;
    userId: string;
}

const DocumentEditorPage = ({ documentId, userId }: DocumentEditorPageProps) => {
    const [activePageId, setActivePageId] = useUserVariable<string>({
        key: "activePage",
        defaultValue: "",
        privacy: "PUBLIC"
    });

    const scopedUserIds = userId ? [userId] : ['__loading__'];

    const pages = useUserListGet<MathDocumentPage>({
        key: 'mathDocumentPages',
        filterFor: documentId,
        userIds: scopedUserIds,
    }) ?? [];

    // HERE

    // Auto-select first page when activePageId is not in current pages
    useEffect(() => {
        if (pages.length > 0 && activePageId.value) {
            // Check if current activePageId exists in the pages
            const activePageExists = pages.some(page => page.value.id === activePageId.value);
            
            if (!activePageExists && !scopedUserIds.includes('__loading__')) {
                // Select the first page (what would be clicked first in sidebar)
                const sortedPages = [...pages].sort((a, b) => a.value.pageNumber - b.value.pageNumber);
                const firstPage = sortedPages[0];
                if (firstPage) {
                    setActivePageId(firstPage.value.id);
                }
            }
        }
    }, [pages.length, pages, activePageId.value, setActivePageId, scopedUserIds]);

    if (pages.length == 0 && !scopedUserIds.includes('__loading__')) {
        return (
            <Column className='flex-1 items-center justify-center px-6'>
                <Animated.View 
                    entering={FadeInDown.duration(500).easing(Easing.inOut(Easing.ease))}
                >
                    <Column className='rounded-2xl border-2 border-border bg-inner-background p-6' gap={4} style={{ maxWidth: '400px' }}>
                        <Column gap={2}>
                            <PoppinsText weight='bold' className='text-xl'>No pages yet</PoppinsText>
                            <PoppinsText>Create the first page to convert handwritten math to LaTeX.</PoppinsText>
                        </Column>
                        <NewPageDialog documentId={documentId} existingPageCount={0} onCreate={setActivePageId} />
                    </Column>
                </Animated.View>
            </Column>
        );
    }

    return (
        <View className='flex-1'>
            {/* This will be handled by DocumentEditor component */}
            <View className={'flex-1 flex-row'}>
                <DocumentSidebar
                    documentId={documentId}
                    userId={userId}
                    activePageId={activePageId.value}
                    onSetActivePageId={setActivePageId}
                />
                <DocumentEditor
                    documentId={documentId}
                    userId={userId}
                    activePageId={activePageId.value}
                    onSetActivePageId={setActivePageId}
                />
            </View>
        </View>
    );
};

export default DocumentEditorPage;
