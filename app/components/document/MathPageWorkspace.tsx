import React, { useEffect, useState } from 'react';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import MarkdownMathPreview from '../ui/markdown/MarkdownMathPreview';
import PageImageCard from './PageImageCard';
import PagePromptCard from './PagePromptCard';
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

    return (
        <Column gap={4} className='flex-1'>
            <Column className='rounded-2xl border-2 border-border bg-inner-background p-4' gap={3}>
                <Row className='items-center justify-between'>
                    <PoppinsText weight='bold' className='text-xl'>Page workspace</PoppinsText>
                    <AppButton variant='outline' className='px-4' onPress={handleDeletePage}>
                        <PoppinsText>Delete page</PoppinsText>
                    </AppButton>
                </Row>
                <Column gap={1}>
                    <PoppinsText weight='medium'>Page title</PoppinsText>
                    <PoppinsTextInput value={titleDraft} onChangeText={setTitleDraft} className='w-full border border-subtle-border bg-background p-3' />
                </Column>
                <Column gap={1}>
                    <PoppinsText weight='medium'>Initial guidance</PoppinsText>
                    <PoppinsTextInput
                        value={guidanceDraft}
                        onChangeText={setGuidanceDraft}
                        placeholder='Example: Keep the section numbering and write every equation with display math.'
                        className='w-full border border-subtle-border bg-background p-3 min-h-28'
                        multiline={true}
                        autoGrow={true}
                    />
                </Column>
                <AppButton variant='green' className='h-12 px-4' onPress={handleSaveDrafts}>
                    <PoppinsText weight='medium' color='white'>Save page details</PoppinsText>
                </AppButton>
            </Column>

            <PageImageCard
                imageUrl={page.imageUrl}
                onChangeImageUrl={(nextUrl) => {
                    commitPage({ ...getDraftPage(), imageUrl: nextUrl }, 'Updated page image');
                }}
            />

            <PagePromptCard documentTitle={documentTitle} page={getDraftPage()} onReplacePage={commitPage} />

            <Column className='rounded-2xl border-2 border-border bg-inner-background p-4' gap={3}>
                <PoppinsText weight='bold' className='text-lg'>Markdown + LaTeX editor</PoppinsText>
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
                <PoppinsText weight='bold' className='text-lg'>Rendered preview</PoppinsText>
                <MarkdownMathPreview markdown={markdownDraft} />
            </Column>
        </Column>
    );
};

export default MathPageWorkspace;
