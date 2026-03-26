import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { ScrollShadow } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import Column from '../layout/Column';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import { useUserList } from 'hooks/useUserList';
import { useUserListGet } from 'hooks/useUserListGet';
import { useUserListSet } from 'hooks/useUserListSet';
import { useCreateUndoSnapshot, useUndoRedo } from 'hooks/useUndoRedo';
import { MathDocument, MathDocumentPage } from 'types/mathDocuments';
import PageListItem from './PageListItem';
import NewPageDialog from './NewPageDialog';
import MathPageWorkspace from './MathPageWorkspace';

interface DocumentEditorPageProps {
    documentId: string;
    userId: string;
}

const DocumentEditorPage = ({ documentId, userId }: DocumentEditorPageProps) => {
    const { executeCommand } = useUndoRedo();
    const createUndoSnapshot = useCreateUndoSnapshot();
    const scopedUserIds = userId ? [userId] : ['__loading__'];
    const setPage = useUserListSet<MathDocumentPage>();
    const [documentRecord, setDocumentRecord] = useUserList<MathDocument>({
        key: 'mathDocuments',
        itemId: documentId,
    });
    const pages = useUserListGet<MathDocumentPage>({
        key: 'mathDocumentPages',
        filterFor: documentId,
        userIds: scopedUserIds,
    }) ?? [];
    const [activePageId, setActivePageId] = useState('');
    const [titleDraft, setTitleDraft] = useState(documentRecord.value?.title ?? '');
    const [descriptionDraft, setDescriptionDraft] = useState(documentRecord.value?.description ?? '');

    useEffect(() => {
        setTitleDraft(documentRecord.value?.title ?? '');
        setDescriptionDraft(documentRecord.value?.description ?? '');
    }, [documentRecord.value?.description, documentRecord.value?.title]);

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

    const activePage = pages.find((page) => page.value.id === activePageId)?.value;
    const sortedPages = [...pages].sort((left, right) => left.value.pageNumber - right.value.pageNumber);
    const highestPageNumber = sortedPages.length > 0 ? sortedPages[sortedPages.length - 1].value.pageNumber : 0;

    const saveDocumentDetails = () => {
        if (!documentRecord.value) {
            return;
        }

        const previousDocument = createUndoSnapshot(documentRecord.value);
        const nextDocument: MathDocument = {
            ...documentRecord.value,
            title: titleDraft.trim() || 'Untitled math document',
            description: descriptionDraft,
            lastOpenedAt: documentRecord.value.lastOpenedAt,
        };

        executeCommand({
            action: () => setDocumentRecord(createUndoSnapshot(nextDocument)),
            undoAction: () => setDocumentRecord(createUndoSnapshot(previousDocument)),
            description: 'Updated document details',
        });
    };

    const replacePage = (nextPage: MathDocumentPage) => {
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
        <View className={Platform.OS === 'web' ? 'flex-1 flex-row gap-4' : 'flex-1 flex-col gap-4'}>
            <Column className={Platform.OS === 'web' ? 'w-[22rem]' : 'w-full'} gap={4}>
                <Column className='rounded-2xl border-2 border-border bg-inner-background p-4' gap={3}>
                    <PoppinsText weight='bold' className='text-2xl'>Document details</PoppinsText>
                    <PoppinsTextInput value={titleDraft} onChangeText={setTitleDraft} className='w-full border border-subtle-border bg-background p-3' />
                    <PoppinsTextInput
                        value={descriptionDraft}
                        onChangeText={setDescriptionDraft}
                        className='w-full border border-subtle-border bg-background p-3 min-h-28'
                        multiline={true}
                        autoGrow={true}
                    />
                    <AppButton variant='green' className='h-12 px-4' onPress={saveDocumentDetails}>
                        <PoppinsText weight='medium' color='white'>Save document</PoppinsText>
                    </AppButton>
                </Column>

                <Column className='rounded-2xl border-2 border-border bg-inner-background p-4 flex-1' gap={3}>
                    <PoppinsText weight='bold' className='text-xl'>Pages</PoppinsText>
                    <NewPageDialog documentId={documentId} existingPageCount={highestPageNumber} onCreate={setActivePageId} />
                    <ScrollShadow LinearGradientComponent={LinearGradient} className='flex-1'>
                        <ScrollView className='flex-1'>
                            <Column gap={2} className='pb-6'>
                                {sortedPages.map((page) => (
                                    <PageListItem
                                        key={page.itemId ?? page.value.id}
                                        page={page.value}
                                        isActive={page.value.id === activePageId}
                                        onPress={() => setActivePageId(page.value.id)}
                                    />
                                ))}
                            </Column>
                        </ScrollView>
                    </ScrollShadow>
                </Column>
            </Column>

            <View className='flex-1'>
                {activePage ? (
                    <ScrollShadow LinearGradientComponent={LinearGradient} className='flex-1'>
                        <ScrollView className='flex-1'>
                            <MathPageWorkspace
                                documentTitle={documentRecord.value?.title ?? 'Untitled math document'}
                                page={activePage}
                                onReplacePage={replacePage}
                                onDeletePage={(nextPageId) => setActivePageId(nextPageId)}
                            />
                        </ScrollView>
                    </ScrollShadow>
                ) : (
                    <Column className='rounded-2xl border-2 border-border bg-inner-background p-6' gap={2}>
                        <PoppinsText weight='bold' className='text-xl'>No pages yet</PoppinsText>
                        <PoppinsText>Create the first page for this document to upload a handwritten math image and generate accessible markdown + LaTeX.</PoppinsText>
                    </Column>
                )}
            </View>
        </View>
    );
};

export default DocumentEditorPage;
