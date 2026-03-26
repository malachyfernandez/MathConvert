import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { useUserList } from 'hooks/useUserList';
import { useUserListGet } from 'hooks/useUserListGet';
import { useUserListSet } from 'hooks/useUserListSet';
import { MathDocument, MathDocumentPage } from 'types/mathDocuments';
import DocumentSidebar from './DocumentSidebar';
import DocumentContent from './DocumentContent';
import NewPageDialog from './NewPageDialog';

interface DocumentEditorPageProps {
    documentId: string;
    userId: string;
}

const DocumentEditorPage = ({ documentId, userId }: DocumentEditorPageProps) => {
    const scopedUserIds = userId ? [userId] : ['__loading__'];
    const [documentRecord] = useUserList<MathDocument>({
        key: 'mathDocuments',
        itemId: documentId,
    });
    const setPage = useUserListSet<MathDocumentPage>();
    const [activePageId, setActivePageId] = useState('');

    const pages = useUserListGet<MathDocumentPage>({
        key: 'mathDocumentPages',
        filterFor: documentId,
        userIds: scopedUserIds,
    }) ?? [];

    const activePage = pages.find((page) => page.value.id === activePageId)?.value || null;

    useEffect(() => {
        if (!pages.length) {
            setActivePageId('');
            return;
        }

        const hasActivePage = pages.some((page) => page.value.id === activePageId);

        if (!hasActivePage) {
            setActivePageId(pages[0].value.id);
        }
    }, [activePageId, pages]);

    const replacePage = (nextPage: MathDocumentPage, _description: string) => {
        void setPage({
            key: 'mathDocumentPages',
            itemId: nextPage.id,
            value: nextPage,
            privacy: 'PUBLIC',
            filterKey: 'documentId',
            searchKeys: ['title', 'markdown', 'initialGuidance'],
            sortKey: 'pageNumber',
        });
    };

    if (!documentRecord.value) {
        return (
            <Column className='flex-1 rounded-2xl border-2 border-border bg-inner-background p-6' gap={2}>
                <PoppinsText weight='bold' className='text-xl'>Loading document</PoppinsText>
                <PoppinsText>Fetching your selected document and pages…</PoppinsText>
            </Column>
        );
    }

    return (
        <View className='flex-1'>
            {pages.length === 0 ? (
                // Centered "No pages yet" state
                <View className='flex-1 items-center justify-center px-6'>
                    <Column className='rounded-2xl border-2 border-border bg-inner-background p-6 gap-4' style={{ maxWidth: '400px' }}>
                        <Column gap={2}>
                            <PoppinsText weight='bold' className='text-xl'>No pages yet</PoppinsText>
                            <PoppinsText>Create the first page to convert handwritten math to LaTeX.</PoppinsText>
                        </Column>
                        <NewPageDialog documentId={documentId} existingPageCount={0} onCreate={setActivePageId} />
                    </Column>
                </View>
            ) : (
                // Normal layout with sidebar when pages exist
                <View className={'flex-1 flex-row gap-4'}>
                    <DocumentSidebar
                        documentId={documentId}
                        userId={userId}
                        activePageId={activePageId}
                        onSetActivePageId={setActivePageId}
                    />
                    <View className='flex-1'>
                        {activePage && (
                            <DocumentContent
                                documentTitle={documentRecord.value?.title ?? 'Untitled math document'}
                                activePage={activePage}
                                onReplacePage={replacePage}
                                onDeletePage={(nextPageId) => setActivePageId(nextPageId)}
                            />
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};

export default DocumentEditorPage;
