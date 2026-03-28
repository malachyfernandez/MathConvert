import React, { useMemo, useState, useRef } from 'react';
import { ActivityIndicator, Platform, ScrollView, View } from 'react-native';
import Column from '../../app/components/layout/Column';
import PoppinsText from '../../app/components/ui/text/PoppinsText';
import { useUserListGet } from '../../hooks/useUserListGet';
import { MathDocument, MathDocumentPage } from '../../types/mathDocuments';
import { createMarkdownMathSourceDocument } from '../../app/components/ui/markdown/createMarkdownMathSourceDocument';
import ViewOnlyDocumentHeader, { ViewOnlyTab } from '../../app/components/document/ViewOnlyDocumentHeader';
import ViewOnlyDocumentPage from '../../app/components/document/ViewOnlyDocumentPage';
import { openViewOnlyPrintWindow } from './openViewOnlyPrintWindow';

interface ViewOnlyDocumentScreenProps {
    documentId: string;
}

const DEFAULT_PAGE_ASPECT_RATIO = 8.5 / 11;

const ViewOnlyDocumentScreen = ({ documentId }: ViewOnlyDocumentScreenProps) => {
    const [activeTab, setActiveTab] = useState<ViewOnlyTab>('imageOverlay');
    const [headerHeight, setHeaderHeight] = useState(0);
    const [pageAspectRatios, setPageAspectRatios] = useState<Record<string, number>>({});
    const [zoomLevel, setZoomLevel] = useState(1);
    const [currentScrollY, setCurrentScrollY] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    // TODO: This route currently relies on globally accessible PUBLIC records.
    // A true per-document share token would require backend/schema support.
    const documentRecords = useUserListGet<MathDocument>({
        key: 'mathDocuments',
        itemId: documentId,
    });

    const pageRecords = useUserListGet<MathDocumentPage>({
        key: 'mathDocumentPages',
        filterFor: documentId,
    });

    const isLoading = documentRecords === undefined || pageRecords === undefined;

    const documentValue = useMemo(() => {
        const record = documentRecords?.[0];
        return record ? record.value : undefined;
    }, [documentRecords]);

    const pages = useMemo(() => {
        return (pageRecords ?? [])
            .map((record: any) => record.value)
            .sort((a: MathDocumentPage, b: MathDocumentPage) => a.pageNumber - b.pageNumber);
    }, [pageRecords]);

    const handleAspectRatioChange = (pageId: string, aspectRatio: number) => {
        setPageAspectRatios((current) => {
            if (current[pageId] === aspectRatio) {
                return current;
            }

            return {
                ...current,
                [pageId]: aspectRatio,
            };
        });
    };

    const handleZoomIn = () => {
        if (Platform.OS === 'web' && scrollViewRef.current) {
            // Calculate new zoom level
            const newZoomLevel = Math.min(zoomLevel + 0.25, 2);
            
            // Calculate the scroll position adjustment to maintain the same visual position
            // Standardize current scroll to zoom level 1, then apply new zoom
            const adjustedScrollY = currentScrollY * (newZoomLevel / zoomLevel);
            
            // Apply zoom level
            setZoomLevel(newZoomLevel);
            
            // Apply adjusted scroll position after a brief delay to allow the zoom to render
            setTimeout(() => {
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({ y: adjustedScrollY, animated: true });
                }
            }, 50);
        } else {
            setZoomLevel((current) => Math.min(current + 0.25, 2));
        }
    };

    const handleZoomOut = () => {
        if (Platform.OS === 'web' && scrollViewRef.current) {
            // Calculate new zoom level
            const newZoomLevel = Math.max(zoomLevel - 0.25, 0.5);
            
            // Calculate the scroll position adjustment to maintain the same visual position
            // Standardize current scroll to zoom level 1, then apply new zoom
            const adjustedScrollY = currentScrollY * (newZoomLevel / zoomLevel);
            
            // Apply zoom level
            setZoomLevel(newZoomLevel);
            
            // Apply adjusted scroll position after a brief delay to allow the zoom to render
            setTimeout(() => {
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({ y: adjustedScrollY, animated: true });
                }
            }, 50);
        } else {
            setZoomLevel((current) => Math.max(current - 0.25, 0.5));
        }
    };

    const handleDownloadPdf = () => {
        if (Platform.OS !== 'web') {
            return;
        }

        openViewOnlyPrintWindow({
            documentTitle: documentValue?.title || 'Math document',
            activeTab,
            pages: pages.map((page: MathDocumentPage) => ({
                id: page.id,
                title: page.title || `Page ${page.pageNumber}`,
                imageUrl: page.imageUrl,
                aspectRatio:
                    pageAspectRatios[page.id] ?? DEFAULT_PAGE_ASPECT_RATIO,
                srcDoc: createMarkdownMathSourceDocument(page.markdown),
            })),
        });
    };

    if (Platform.OS !== 'web') {
        return (
            <View className='flex-1 items-center justify-center bg-background p-6'>
                <Column className='items-center' gap={3}>
                    <PoppinsText weight='bold' className='text-lg text-center'>
                        View-only pages are only supported on web
                    </PoppinsText>
                    <PoppinsText varient='subtext' className='text-center'>
                        This screen uses iframe-based MathJax rendering.
                    </PoppinsText>
                </Column>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-background p-6'>
                <Column className='items-center' gap={3}>
                    <ActivityIndicator />
                    <PoppinsText varient='subtext'>Loading document…</PoppinsText>
                </Column>
            </View>
        );
    }

    if (!documentValue) {
        return (
            <View className='flex-1 items-center justify-center bg-background p-6'>
                <Column className='items-center' gap={3}>
                    <PoppinsText weight='bold' className='text-lg text-center'>
                        Document not found
                    </PoppinsText>
                    <PoppinsText varient='subtext' className='text-center'>
                        It may not exist or may not be publicly accessible.
                    </PoppinsText>
                </Column>
            </View>
        );
    }

    if (!documentId) {
        return (
            <View className='flex-1 items-center justify-center bg-background p-6'>
                <Column className='items-center' gap={3}>
                    <PoppinsText weight='bold' className='text-lg text-center'>
                        Missing document ID
                    </PoppinsText>
                    <PoppinsText varient='subtext' className='text-center'>
                        Please provide a valid document ID in the URL.
                    </PoppinsText>
                </Column>
            </View>
        );
    }

    return (
        <View className='flex-1 bg-background'>
            <ViewOnlyDocumentHeader
                activeTab={activeTab}
                documentTitle={documentValue.title}
                documentDescription={documentValue.description}
                pageCount={pages.length}
                onDownloadPdf={handleDownloadPdf}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                zoomLevel={zoomLevel}
                onLayout={(event: any) => {
                    setHeaderHeight(event.nativeEvent.layout.height);
                }}
                onTabChange={setActiveTab}
            />

            <ScrollView
                ref={scrollViewRef}
                className='flex-1'
                contentContainerStyle={{
                    paddingTop: headerHeight + 16,
                    paddingBottom: 24,
                    paddingHorizontal: 16,
                }}
                onScroll={(event) => {
                    setCurrentScrollY(event.nativeEvent.contentOffset.y);
                }}
                scrollEventThrottle={16}
            >
                <Column className='mx-auto w-full' gap={6}>
                    {pages.length ? (
                        pages.map((page: MathDocumentPage) => (
                            <ViewOnlyDocumentPage
                                key={page.id}
                                activeTab={activeTab}
                                page={page}
                                zoomLevel={zoomLevel}
                                onAspectRatioChange={handleAspectRatioChange}
                            />
                        ))
                    ) : (
                        <View className='items-center justify-center rounded-2xl border border-subtle-border bg-inner-background p-8'>
                            <Column className='items-center' gap={2}>
                                <PoppinsText weight='bold'>No pages yet</PoppinsText>
                                <PoppinsText varient='subtext' className='text-center'>
                                    This document does not have any pages to display.
                                </PoppinsText>
                            </Column>
                        </View>
                    )}
                </Column>
            </ScrollView>
        </View>
    );
};

export default ViewOnlyDocumentScreen;
