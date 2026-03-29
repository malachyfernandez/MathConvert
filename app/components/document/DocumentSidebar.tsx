import React, { useState } from 'react';
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { ScrollShadow } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import AppButton from '../ui/buttons/AppButton';
import { useUserList } from 'hooks/useUserList';
import { useUserListGet } from 'hooks/useUserListGet';
import { useUserListRemove } from 'hooks/useUserListRemove';
import { useUserListSet } from 'hooks/useUserListSet';
import { useCreateUndoSnapshot, useUndoRedo } from 'hooks/useUndoRedo';
import { MathDocument, MathDocumentPage } from 'types/mathDocuments';
import PageListItem from './PageListItem';
import NewPageDialog from './NewPageDialog';
import PageConfigDialog from './PageConfigDialog';
import DocumentDetails from './DocumentDetails';
import ReorderPagesDialog from './ReorderPagesDialog';

interface DocumentSidebarProps {
    documentId: string;
    userId: string;
    activePageId: string;
    onSetActivePageId: (pageId: string) => void;
    onHideSidebar?: () => void;
}

const DocumentSidebar = ({ documentId, userId, activePageId, onSetActivePageId, onHideSidebar }: DocumentSidebarProps) => {
    const { executeCommand } = useUndoRedo();
    const createUndoSnapshot = useCreateUndoSnapshot();
    const scopedUserIds = userId ? [userId] : ['__loading__'];
    const [documentRecord] = useUserList<MathDocument>({
        key: 'mathDocuments',
        itemId: documentId,
    });
    const setPage = useUserListSet<MathDocumentPage>();
    const removePage = useUserListRemove();
    const restorePage = useUserListSet<MathDocumentPage>();

    const [pageConfigDialogOpen, setPageConfigDialogOpen] = useState(false);
    const [configuringPage, setConfiguringPage] = useState<MathDocumentPage | null>(null);
    const [reorderDialogOpen, setReorderDialogOpen] = useState(false);

    const pages = useUserListGet<MathDocumentPage>({
        key: 'mathDocumentPages',
        filterFor: documentId,
        userIds: scopedUserIds,
    }) ?? [];

    const sortedPages = [...pages].sort((left, right) => left.value.pageNumber - right.value.pageNumber);
    const highestPageNumber = sortedPages.length > 0 ? sortedPages[sortedPages.length - 1].value.pageNumber : 0;

    const handlePageConfig = (page: MathDocumentPage) => {
        setConfiguringPage(page);
        setPageConfigDialogOpen(true);
    };

    const handlePageConfigOpenChange = (open: boolean) => {
        setPageConfigDialogOpen(open);

        if (!open) {
            setConfiguringPage(null);
        }
    };

    const handlePageUpdate = (updatedPage: MathDocumentPage) => {
        void setPage({
            key: 'mathDocumentPages',
            itemId: updatedPage.id,
            value: updatedPage,
            privacy: 'PUBLIC',
            filterKey: 'documentId',
            searchKeys: ['title', 'markdown'],
            sortKey: 'pageNumber',
        });
    };

    const handlePageDelete = () => {
        if (configuringPage) {
            const deletedPage = createUndoSnapshot(configuringPage);

            executeCommand({
                action: () => {
                    void removePage({ key: 'mathDocumentPages', itemId: configuringPage.id });
                    onSetActivePageId('');
                },
                undoAction: () => {
                    void restorePage({
                        key: 'mathDocumentPages',
                        itemId: deletedPage.id,
                        value: deletedPage,
                        privacy: 'PUBLIC',
                        filterKey: 'documentId',
                        searchKeys: ['title', 'markdown'],
                        sortKey: 'pageNumber',
                    });
                    onSetActivePageId(deletedPage.id);
                },
                description: 'Deleted page',
            });
        }
    };

    const handleReorderPages = (updatedPages: MathDocumentPage[]) => {
        updatedPages.forEach((page) => {
            void setPage({
                key: 'mathDocumentPages',
                itemId: page.id,
                value: page,
                privacy: 'PUBLIC',
                filterKey: 'documentId',
                searchKeys: ['title', 'markdown'],
                sortKey: 'pageNumber',
            });
        });
    };

    if (!documentRecord.value) {
        return null;
    }

    return (
        <Column gap={0} className='h-full'>
            <Column className={`flex-1 ${Platform.OS === 'web' ? 'w-64' : 'w-full'}`} gap={4}>
                <Column className='rounded-tr-2xl border-t-2 border-r-2 border-border bg-inner-background p-4 flex-1' gap={3}>
                    <PoppinsText weight='bold' varient='cardHeader'>Pages</PoppinsText>
                    <NewPageDialog 
                        documentId={documentId} 
                        existingPageCount={highestPageNumber} 
                        triggerButtonVariant='green'
                        createButtonVariant='green'
                        onCreate={(pageId) => {
                            onSetActivePageId(pageId);
                            onHideSidebar?.();
                        }} 
                    />
                    <ScrollShadow LinearGradientComponent={LinearGradient} className='flex-1'>
                        <ScrollView className='flex-1'>
                            <Column gap={2} className='pb-6'>
                                {sortedPages.map((page) => (
                                    <PageListItem
                                        key={page.itemId ?? page.value.id}
                                        page={page.value}
                                        isActive={page.value.id === activePageId}
                                        onPress={() => {
    onSetActivePageId(page.value.id);
    onHideSidebar?.();
}}
                                        onConfigure={() => handlePageConfig(page.value)}
                                    />
                                ))}
                                <View className='w-full items-center justify-center'>
                                    {sortedPages.length > 1 && (
                                        <AppButton variant='black' className='h-8! w-32! rounded-full' onPress={() => setReorderDialogOpen(true)}>
                                            <PoppinsText weight='regular' color='white'>Reorder Pages</PoppinsText>
                                        </AppButton>
                                    )}
                                </View>
                            </Column>
                        </ScrollView>
                    </ScrollShadow>

                </Column>

                {/* <DocumentDetails document={documentRecord.value} /> */}

            </Column>
            {configuringPage && (
                <PageConfigDialog
                    page={configuringPage}
                    isOpen={pageConfigDialogOpen}
                    onOpenChange={handlePageConfigOpenChange}
                    onUpdate={handlePageUpdate}
                    onDelete={handlePageDelete}
                />
            )}
            <ReorderPagesDialog
                pages={sortedPages.map(p => p.value)}
                isOpen={reorderDialogOpen}
                onOpenChange={setReorderDialogOpen}
                onReorderPages={handleReorderPages}
            />
        </Column>
    );
};

export default DocumentSidebar;
