import React, { useEffect, useMemo, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { MathDocumentPage } from 'types/mathDocuments';
import { createMarkdownMathSourceDocument } from '../ui/markdown/createMarkdownMathSourceDocument';
import { ViewOnlyTab } from './ViewOnlyDocumentHeader';

interface ViewOnlyDocumentPageProps {
    activeTab: ViewOnlyTab;
    page: MathDocumentPage;
    onAspectRatioChange?: (pageId: string, aspectRatio: number) => void;
}

const DEFAULT_PAGE_ASPECT_RATIO = 8.5 / 11;

const ViewOnlyDocumentPage = ({ activeTab, page, onAspectRatioChange }: ViewOnlyDocumentPageProps) => {
    const [imageAspectRatio, setImageAspectRatio] = useState(DEFAULT_PAGE_ASPECT_RATIO);

    useEffect(() => {
        let isMounted = true;

        if (Platform.OS !== 'web' || typeof window === 'undefined' || !page.imageUrl) {
            return undefined;
        }

        const previewImage = new window.Image();

        previewImage.onload = () => {
            if (!isMounted || !previewImage.width || !previewImage.height) {
                return;
            }

            const nextAspectRatio = previewImage.width / previewImage.height;
            setImageAspectRatio(nextAspectRatio);
            onAspectRatioChange?.(page.id, nextAspectRatio);
        };

        previewImage.src = page.imageUrl;

        return () => {
            isMounted = false;
        };
    }, [onAspectRatioChange, page.id, page.imageUrl]);

    const iframeSource = useMemo(() => createMarkdownMathSourceDocument(page.markdown), [page.markdown]);
    const imageOpacity = activeTab === 'imageOverlay' ? 1 : 0;

    return (
        <Column gap={3} className='w-full'>
            <View
                className='relative w-full overflow-hidden rounded-2xl border border-subtle-border bg-inner-background'
                style={{
                    aspectRatio: imageAspectRatio,
                    alignSelf: 'center',
                    maxWidth: 920,
                }}
            >
                <iframe
                    title={`View only math page ${page.pageNumber}`}
                    srcDoc={iframeSource}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#f6eedb',
                    }}
                />
                <View
                    pointerEvents='none'
                    className='absolute inset-0'
                    style={{ opacity: imageOpacity }}
                >
                    <Image
                        source={{ uri: page.imageUrl }}
                        accessibilityLabel={`Original page image ${page.pageNumber}`}
                        resizeMode='cover'
                        className='h-full w-full'
                    />
                </View>
            </View>
            <Column gap={0} className='px-1'>
                <PoppinsText weight='medium'>
                    {page.title || `Page ${page.pageNumber}`}
                </PoppinsText>
                <PoppinsText varient='subtext'>
                    {activeTab === 'imageOverlay' ? 'Image overlay with readable MathJax underneath.' : 'Screen-readable MathJax page.'}
                </PoppinsText>
            </Column>
        </Column>
    );
};

export default ViewOnlyDocumentPage;
