import React, { useState } from 'react';
import { Platform, ScrollView, TouchableOpacity } from 'react-native';
import { ScrollShadow } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
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

interface DocumentSidebarProps {
    documentId: string;
    userId: string;
    activePageId: string;
    onSetActivePageId: (pageId: string) => void;
}

const DocumentSidebar = ({ documentId, userId, activePageId, onSetActivePageId }: DocumentSidebarProps) => {
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
            searchKeys: ['title', 'markdown', 'initialGuidance'],
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
                        searchKeys: ['title', 'markdown', 'initialGuidance'],
                        sortKey: 'pageNumber',
                    });
                    onSetActivePageId(deletedPage.id);
                },
                description: 'Deleted page',
            });
        }
    };

    if (!documentRecord.value) {
        return null;
    }

    return (
        <Column gap={0} className='h-full'>
            <Column className={`flex-1 ${Platform.OS === 'web' ? 'w-88' : 'w-full'}`} gap={4}>
                <Column className='rounded-2xl border-2 border-border bg-inner-background p-4 flex-1' gap={3}>
                    <PoppinsText weight='bold' varient='cardHeader'>Pages</PoppinsText>
                    <NewPageDialog documentId={documentId} existingPageCount={highestPageNumber} onCreate={onSetActivePageId} />
                    <ScrollShadow LinearGradientComponent={LinearGradient} className='flex-1'>
                        <ScrollView className='flex-1'>
                            <Column gap={2} className='pb-6'>
                                {sortedPages.map((page) => (
                                    <PageListItem
                                        key={page.itemId ?? page.value.id}
                                        page={page.value}
                                        isActive={page.value.id === activePageId}
                                        onPress={() => onSetActivePageId(page.value.id)}
                                        onConfigure={() => handlePageConfig(page.value)}
                                    />
                                ))}
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
        </Column>
    );
};

export default DocumentSidebar;
