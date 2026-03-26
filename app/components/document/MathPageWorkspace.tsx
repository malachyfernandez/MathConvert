import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import MarkdownMathPreview from '../ui/markdown/MarkdownMathPreview';
import PageImageCard from './PageImageCard';
import PagePromptCard from './PagePromptCard';
import EditPageDialog from './EditPageDialog';
import { useCreateUndoSnapshot, useUndoRedo } from 'hooks/useUndoRedo';
import { useUserListRemove } from 'hooks/useUserListRemove';
import { useUserListSet } from 'hooks/useUserListSet';
import { MathDocumentPage } from 'types/mathDocuments';

interface MathPageWorkspaceProps {
    documentTitle: string;
    page: MathDocumentPage;
    onReplacePage: (nextPage: MathDocumentPage, description: string) => void;
    onDeletePage: (pageId: string) => void;
}

const MathPageWorkspace = ({ documentTitle, page, onReplacePage, onDeletePage }: MathPageWorkspaceProps) => {
    const { executeCommand } = useUndoRedo();
    const createUndoSnapshot = useCreateUndoSnapshot();
    const removePage = useUserListRemove();
    const restorePage = useUserListSet<MathDocumentPage>();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [titleDraft, setTitleDraft] = useState(page.title);
    const [guidanceDraft, setGuidanceDraft] = useState(page.initialGuidance);
    const [markdownDraft, setMarkdownDraft] = useState(page.markdown);

    useEffect(() => {
        setTitleDraft(page.title);
        setGuidanceDraft(page.initialGuidance);
        setMarkdownDraft(page.markdown);
    }, [page]);

    const getDraftPage = () => {
        return {
            ...page,
            title: titleDraft.trim() || `Page ${page.pageNumber}`,
            initialGuidance: guidanceDraft,
            markdown: markdownDraft,
        };
    };

    const commitPage = (nextPage: MathDocumentPage, description: string) => {
        const previousPage = createUndoSnapshot(page);
        const finalNextPage = createUndoSnapshot(nextPage);

        executeCommand({
            action: () => onReplacePage(finalNextPage, description),
            undoAction: () => onReplacePage(previousPage, `Undo ${description}`),
            description,
        });
    };

    const handleSaveDrafts = () => {
        commitPage(getDraftPage(), 'Updated page content');
    };

    const handleDeletePage = () => {
        const deletedPage = createUndoSnapshot(page);

        executeCommand({
            action: () => {
                void removePage({ key: 'mathDocumentPages', itemId: page.id });
                onDeletePage('');
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
                onDeletePage(deletedPage.id);
            },
            description: 'Deleted page',
        });
    };

    const handlePageUpdate = (updatedPage: MathDocumentPage) => {
        commitPage(updatedPage, 'Updated page details');
    };

    return (
        <Column gap={4} className='flex-1'>
            <Column className='rounded-2xl border-2 border-border bg-inner-background p-4' gap={3}>
                <Row className='items-center justify-between'>
                    <PoppinsText weight='bold' varient='cardHeader'>Page workspace</PoppinsText>
                    <AppButton variant='red' className='px-4' onPress={handleDeletePage}>
                        <PoppinsText className='text-red-500 font-medium'>Delete page</PoppinsText>
                    </AppButton>
                </Row>
                <TouchableOpacity onPress={() => setIsEditDialogOpen(true)}>
                    <Column gap={1}>
                        <PoppinsText weight='medium'>Page title</PoppinsText>
                        <Column className='rounded-lg border border-subtle-border bg-background p-3'>
                            <PoppinsText weight='bold' className='text-text opacity-70'>
                                {titleDraft || `Page ${page.pageNumber}`}
                            </PoppinsText>
                        </Column>
                    </Column>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditDialogOpen(true)}>
                    <Column gap={1}>
                        <PoppinsText weight='medium'>Initial guidance</PoppinsText>
                        <Column className='rounded-lg border border-subtle-border bg-background p-3 min-h-28 justify-start'>
                            <PoppinsText varient='subtext' className='text-text opacity-70'>
                                {guidanceDraft || 'No guidance set'}
                            </PoppinsText>
                        </Column>
                    </Column>
                </TouchableOpacity>
            </Column>

            <PageImageCard
                imageUrl={page.imageUrl}
                onChangeImageUrl={(nextUrl) => {
                    commitPage({ ...getDraftPage(), imageUrl: nextUrl }, 'Updated page image');
                }}
            />

            <PagePromptCard documentTitle={documentTitle} page={getDraftPage()} onReplacePage={commitPage} />

            <Column className='rounded-2xl border-2 border-border bg-inner-background p-4' gap={3}>
                <PoppinsText weight='bold' varient='cardHeader'>Markdown + LaTeX editor</PoppinsText>
                <PoppinsTextInput
                    value={markdownDraft}
                    onChangeText={setMarkdownDraft}
                    placeholder='Your markdown and LaTeX will appear here.'
                    className='w-full border border-subtle-border bg-background p-3 min-h-72'
                    multiline={true}
                    autoGrow={true}
                />
                <AppButton variant='green' className='h-12 px-4' onPress={handleSaveDrafts}>
                    <PoppinsText weight='medium' color='white'>Save markdown</PoppinsText>
                </AppButton>
            </Column>

            <Column className='rounded-2xl border-2 border-border bg-inner-background p-4' gap={3}>
                <PoppinsText weight='bold' varient='cardHeader'>Rendered preview</PoppinsText>
                <MarkdownMathPreview markdown={markdownDraft} />
            </Column>
            
            <EditPageDialog
                page={page}
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onUpdate={handlePageUpdate}
            />
        </Column>
    );
};

export default MathPageWorkspace;
