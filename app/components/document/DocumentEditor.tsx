import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import { useUserList } from 'hooks/useUserList';
import { useUserListGet } from 'hooks/useUserListGet';
import { useUserListSet } from 'hooks/useUserListSet';
import { MathDocument, MathDocumentPage } from 'types/mathDocuments';
import DocumentContent from './DocumentContent';
import DocumentContentPreview from './DocumentContentPreview';
import ImageColumn from './ImageColumn';
import NewPageDialog from './NewPageDialog';

interface DocumentEditorProps {
    documentId: string;
    userId: string;
    activePageId: string;
    onSetActivePageId: (pageId: string) => void;
}

const DocumentEditor = ({ documentId, userId, activePageId, onSetActivePageId }: DocumentEditorProps) => {
    const scopedUserIds = userId ? [userId] : ['__loading__'];

    const [documentRecord] = useUserList<MathDocument>({
        key: 'mathDocuments',
        itemId: documentId,
    });
    const setPage = useUserListSet<MathDocumentPage>();

    const pages = useUserListGet<MathDocumentPage>({
        key: 'mathDocumentPages',
        filterFor: documentId,
        userIds: scopedUserIds,
    }) ?? [];

    const activePage = pages.find((page) => page.value.id === activePageId)?.value || null;

    useEffect(() => {
        // Don't reset during initial loading
        if (!pages[0] || activePageId !== '') {
            return;
        }

        // Only reset to empty if pages are explicitly empty (not loading)
        if (!pages.length) {
            onSetActivePageId('');
            return;
        }

        const hasActivePage = pages.some((page) => page.value.id === activePageId);

        if (!hasActivePage) {
            onSetActivePageId(pages[0].value.id);
        }
    }, [activePageId, pages, onSetActivePageId]);

    const replacePage = (nextPage: MathDocumentPage, _description: string) => {
        void setPage({
            key: 'mathDocumentPages',
            itemId: nextPage.id,
            value: nextPage,
            privacy: 'PUBLIC',
            filterKey: 'documentId',
            searchKeys: ['title', 'markdown'],
            sortKey: 'pageNumber',
        });
    };

    const [isPreview, setIsPreview] = useState(true);

    if (!documentRecord.value) {
        return (
            <Column className='flex-1 rounded-2xl border-2 border-border bg-inner-background p-6' gap={2}>
                <PoppinsText weight='bold' className='text-xl'>Loading document</PoppinsText>
                <PoppinsText>Fetching your selected document and pages…</PoppinsText>
            </Column>
        );
    }

    if (pages.length === 0) {
        return (
            <Column className='flex-1 items-center justify-center px-6'>
                <Column className='rounded-2xl border-2 border-border bg-inner-background p-6' gap={4} style={{ maxWidth: '400px' }}>
                    <Column gap={2}>
                        <PoppinsText weight='bold' className='text-xl'>No pages yet</PoppinsText>
                        <PoppinsText>Create the first page to convert handwritten math to LaTeX.</PoppinsText>
                    </Column>
                    <NewPageDialog documentId={documentId} existingPageCount={0} onCreate={onSetActivePageId} />
                </Column>
            </Column>
        );
    }

    return (
        <View className='flex-1 flex-col sm:flex-row gap-4'>
            <View className='sm:flex-1'>
                <View className='h-48 sm:h-full border-b border-subtle-border sm:border-0 -mb-4'>
                    <ImageColumn
                        page={activePage}
                        onImageChange={(url) => {
                            if (activePage) {
                                replacePage({ ...activePage, imageUrl: url }, 'Updated page image');
                            }
                        }}
                    />
                </View>
            </View>

            {activePage?.imageUrl && (
                <View className='flex-1 min-w-min sm:min-w-[400px] shrink-0 px-4 sm:pl-0'>
                    {isPreview ? (
                        <DocumentContentPreview
                            documentId={documentId}
                            activePage={activePage}
                            text={`HERE IS MARKDOWN LOOK AT ME!`}
                        />
                    ) : (
                        <DocumentContent
                            documentTitle={documentRecord.value?.title ?? 'Untitled math document'}
                            documentId={documentId}
                            activePage={activePage}
                            onReplacePage={replacePage}
                            onDeletePage={(nextPageId) => onSetActivePageId(nextPageId)}
                        />

                    )}
                </View>
            )}
        </View>
    );
};

export default DocumentEditor;
