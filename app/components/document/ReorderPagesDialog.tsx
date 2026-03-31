import React, { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { ScrollShadow } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import Column from '../layout/Column';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import StatusButton from '../ui/StatusButton';
import { MathDocumentPage } from 'types/mathDocuments';
import UnsavedChangesDialog from './UnsavedChangesDialog';
import PageConfigDialog from './PageConfigDialog';
import ReorderablePageItem from './ReorderablePageItem';

interface ReorderPagesDialogProps {
    pages: MathDocumentPage[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onReorderPages: (updatedPages: MathDocumentPage[]) => void;
}

const ReorderPagesDialog = ({ pages, isOpen, onOpenChange, onReorderPages }: ReorderPagesDialogProps) => {
    const [orderedPages, setOrderedPages] = useState<MathDocumentPage[]>(() =>
        [...pages].sort((a, b) => a.pageNumber - b.pageNumber)
    );
    const [animatingPages, setAnimatingPages] = useState<Set<string>>(new Set());
    const [hasReordered, setHasReordered] = useState(false);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [configDialogPage, setConfigDialogPage] = useState<MathDocumentPage | null>(null);
    const [showConfigDialog, setShowConfigDialog] = useState(false);

    // Helper function to render page title with number
    const renderPageTitle = (title: string, pageNumber: number) => {
        return `${title} - ${pageNumber}`;
    };

    React.useEffect(() => {
        if (isOpen) {
            setOrderedPages([...pages].sort((a, b) => a.pageNumber - b.pageNumber));
            setAnimatingPages(new Set());
            setHasReordered(false);
        }
    }, [isOpen, pages]);

    const handleMoveUp = (index: number) => {
        if (index === 0) return;

        const currentPage = orderedPages[index];
        const previousPage = orderedPages[index - 1];

        // Start animation
        setAnimatingPages(new Set([currentPage.id, previousPage.id]));

        // Perform the swap after a brief delay to trigger animation
        setTimeout(() => {
            const newOrderedPages = [...orderedPages];
            const [movedPage] = newOrderedPages.splice(index, 1);
            newOrderedPages.splice(index - 1, 0, movedPage);

            // Update page numbers to reflect new order
            const updatedPages = newOrderedPages.map((page, idx) => ({
                ...page,
                pageNumber: idx + 1
            }));

            setOrderedPages(updatedPages);
            setHasReordered(true);

            // Clear animation state
            setTimeout(() => {
                setAnimatingPages(new Set());
            }, 100);
        }, 50);
    };

    const handleMoveDown = (index: number) => {
        if (index === orderedPages.length - 1) return;

        const currentPage = orderedPages[index];
        const nextPage = orderedPages[index + 1];

        // Start animation
        setAnimatingPages(new Set([currentPage.id, nextPage.id]));

        // Perform the swap after a brief delay to trigger animation
        setTimeout(() => {
            const newOrderedPages = [...orderedPages];
            const [movedPage] = newOrderedPages.splice(index, 1);
            newOrderedPages.splice(index + 1, 0, movedPage);

            // Update page numbers to reflect new order
            const updatedPages = newOrderedPages.map((page, idx) => ({
                ...page,
                pageNumber: idx + 1
            }));

            setOrderedPages(updatedPages);
            setHasReordered(true);

            // Clear animation state
            setTimeout(() => {
                setAnimatingPages(new Set());
            }, 100);
        }, 50);
    };

    const handleDone = () => {
        onReorderPages(orderedPages);
        onOpenChange(false);
    };

    const handleCancel = () => {
        if (hasReordered) {
            setShowUnsavedDialog(true);
        } else {
            onOpenChange(false);
        }
    };

    const handleConfirmDiscard = () => {
        setShowUnsavedDialog(false);
        onOpenChange(false);
    };

    const handleCancelDiscard = () => {
        setShowUnsavedDialog(false);
    };

    const handlePagePress = (page: MathDocumentPage) => {
        setConfigDialogPage(page);
        setShowConfigDialog(true);
    };

    const handlePageUpdate = (updatedPage: MathDocumentPage) => {
        const updatedPages = orderedPages.map(page =>
            page.id === updatedPage.id ? updatedPage : page
        );
        setOrderedPages(updatedPages);
        setHasReordered(true);
    };

    const handlePageDelete = () => {
        if (configDialogPage) {
            const updatedPages = orderedPages.filter(page => page.id !== configDialogPage.id);
            // Update page numbers after deletion
            const renumberedPages = updatedPages.map((page, idx) => ({
                ...page,
                pageNumber: idx + 1
            }));
            setOrderedPages(renumberedPages);
            setHasReordered(true);
        }
    };

    if (Platform.OS !== 'web') {
        return null;
    }

    return (
        <>
            <ConvexDialog.Root isOpen={isOpen} onOpenChange={handleCancel}>
                <ConvexDialog.Portal>
                    <ConvexDialog.Overlay />
                    <ConvexDialog.Content>
                        <ConvexDialog.Close iconProps={{ color: 'rgb(246, 238, 219)' }} className='w-10 h-10 bg-accent-hover absolute right-4 top-4 z-10' />
                        <Column className='h-full'>
                            <DialogHeader text='Reorder pages' subtext='Arrange your pages in the desired order.' />
                            <Column className='pt-5 flex-1'>
                                <ScrollShadow LinearGradientComponent={LinearGradient} className='flex-1'>
                                    <ScrollView className='flex-1 max-h-[60vh]'>
                                        <Column gap={2} className='pb-4'>
                                            {orderedPages.map((page, index) => (
                                                <ReorderablePageItem
                                                    key={page.id}
                                                    page={page}
                                                    index={index}
                                                    totalCount={orderedPages.length}
                                                    isAnimating={animatingPages.has(page.id)}
                                                    onPress={() => handlePagePress(page)}
                                                    onMoveUp={() => handleMoveUp(index)}
                                                    onMoveDown={() => handleMoveDown(index)}
                                                />
                                            ))}
                                        </Column>
                                    </ScrollView>
                                </ScrollShadow>
                            </Column>
                            <Column className='pt-4'>
                                <AppButton variant='black' className='h-12' onPress={handleDone}>
                                    <PoppinsText weight='medium' color='white'>Save Changes</PoppinsText>
                                </AppButton>
                            </Column>
                        </Column>
                    </ConvexDialog.Content>
                </ConvexDialog.Portal>
            </ConvexDialog.Root>

            <UnsavedChangesDialog
                isOpen={showUnsavedDialog}
                onOpenChange={setShowUnsavedDialog}
                onConfirmDiscard={handleConfirmDiscard}
            />

            {configDialogPage && (
                <PageConfigDialog
                    page={configDialogPage}
                    isOpen={showConfigDialog}
                    onOpenChange={setShowConfigDialog}
                    onUpdate={handlePageUpdate}
                    onDelete={handlePageDelete}
                />
            )}
        </>
    );
};

export default ReorderPagesDialog;
