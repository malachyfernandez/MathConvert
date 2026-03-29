import React, { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { ScrollShadow } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import StatusButton from '../ui/StatusButton';
import StatusIconButton from '../ui/StatusIconButton';
import { MathDocumentPage } from 'types/mathDocuments';
import ChevronUpIcon from '../ui/icons/ChevronUpIcon';
import ChevronDownIcon from '../ui/icons/ChevronDownIcon';
import UnsavedChangesDialog from './UnsavedChangesDialog';
import PageConfigDialog from './PageConfigDialog';

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
                                            {orderedPages.map((page, index) => {
                                                const isAnimating = animatingPages.has(page.id);
                                                return (
                                                    <Row
                                                        key={page.id}
                                                        className={`border border-subtle-border bg-inner-background rounded-xl p-3 w-full justify-between transition-all duration-100 ease-in-out ${isAnimating ? 'scale-55 opacity-70' : ''
                                                            }`}
                                                    >


                                                        <Row className='items-center w-full justify-between'>
                                                            <Row gap={2}
                                                            // className="bg-[#374559ae] rounded"
                                                            >
                                                                {index > 0 ? (
                                                                    <AppButton variant='none' className='h-10 w-10' onPress={() => handleMoveUp(index)}>
                                                                        <ChevronUpIcon size={24} color="black" />
                                                                    </AppButton>
                                                                ) : (
                                                                    // <></>
                                                                    <StatusIconButton
                                                                        icon={<ChevronUpIcon size={20} color="white" />}
                                                                        className="h-10 w-10"
                                                                        variant="none"
                                                                    />
                                                                )}
                                                            </Row>
                                                            <Column className='flex-1 justify-center' gap={1}>
                                                                <AppButton variant='none' className='flex-1' onPress={() => handlePagePress(page)}>
                                                                    <Column className='flex-1 justify-center' gap={1}>
                                                                        <PoppinsText weight='medium' className='text-center'>
                                                                            {page.title || `Page ${page.pageNumber}`}
                                                                        </PoppinsText>
                                                                        <PoppinsText varient='subtext' className='text-xs text-center'>
                                                                            Page {page.pageNumber}
                                                                        </PoppinsText>
                                                                    </Column>
                                                                </AppButton>
                                                            </Column>
                                                            <Row gap={2}
                                                            // className="bg-[#374559ae] rounded"
                                                            >

                                                                {index < orderedPages.length - 1 ? (
                                                                    <AppButton variant='none' className='h-10 w-10' onPress={() => handleMoveDown(index)}>
                                                                        <ChevronDownIcon size={24} color="black" />
                                                                    </AppButton>
                                                                ) : (
                                                                    // <></>
                                                                    <StatusIconButton
                                                                        icon={<ChevronDownIcon size={20} color="white" />}
                                                                        className="h-10 w-10"
                                                                        variant="none"
                                                                    />
                                                                )}
                                                            </Row>
                                                        </Row>
                                                    </Row>
                                                );
                                            })}
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
