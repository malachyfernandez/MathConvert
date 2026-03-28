import React, { useEffect, useMemo, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { MathDocumentPage } from 'types/mathDocuments';
import { createMarkdownMathSourceDocument } from '../ui/markdown/createMarkdownMathSourceDocument';
import { ViewOnlyTab } from './ViewOnlyDocumentHeader';
import Row from '../layout/Row';

interface ViewOnlyDocumentPageProps {
    activeTab: ViewOnlyTab;
    page: MathDocumentPage;
    zoomLevel?: number;
    onAspectRatioChange?: (pageId: string, aspectRatio: number) => void;
}

const DEFAULT_PAGE_ASPECT_RATIO = 8.5 / 11;

const ViewOnlyDocumentPage = ({ activeTab, page, zoomLevel = 1, onAspectRatioChange }: ViewOnlyDocumentPageProps) => {
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
            <Row gap={0} className={`px-1 mx-auto`} style={{ width: 920 * zoomLevel }}>
                <PoppinsText weight='medium'>
                    {page.title || `Page ${page.pageNumber}`}
                </PoppinsText>
                    {/* <PoppinsText varient='subtext'>
                        {activeTab === 'imageOverlay' ? 'Image overlay with readable MathJax underneath.' : 'Screen-readable MathJax page.'}
                    </PoppinsText> */}
            </Row>
            <View
                className='relative w-full h-min rounded-2xl border overflow-hidden border-subtle-border bg-inner-background transition-all'
                style={{
                    aspectRatio: imageAspectRatio,
                    alignSelf: 'center',
                    maxWidth: 920,
                    width: 920,
                    transform: [{ scale: zoomLevel }],
                    marginBlock: -800 * (1 - zoomLevel),
                }}
                accessibilityLabel={`DOES THIS WORK`}
            >
                <View
                    className='h-full w-full'
                >
                    <iframe
                        title={`View only math page ${page.pageNumber}`}
                        srcDoc={iframeSource}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: 920,
                            height: '100%',
                            border: 'none',
                            backgroundColor: 'rgb(246, 238, 219)',
                        }}
                    />
                </View>
                <View
                    pointerEvents='none'
                    className='absolute inset-0'
                    style={{ opacity: imageOpacity }}
                >
                    <Image
                        source={{ uri: page.imageUrl }}
                        accessibilityLabel={`Original page image ${page.pageNumber}`}
                        resizeMode='cover'
                        className='h-full w-[920px]'
                    />
                </View>
            </View>
            
        </Column>
    );
};

export default ViewOnlyDocumentPage;
