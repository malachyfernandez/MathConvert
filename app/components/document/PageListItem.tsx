import React from 'react';
import { TouchableOpacity } from 'react-native';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { MathDocumentPage } from 'types/mathDocuments';

interface PageListItemProps {
    page: MathDocumentPage;
    isActive: boolean;
    onPress: () => void;
}

const PageListItem = ({ page, isActive, onPress }: PageListItemProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className={`rounded-xl border p-3 ${isActive ? 'border-primary-accent bg-primary-accent/10' : 'border-subtle-border bg-inner-background'}`}
        >
            <Column gap={1}>
                <PoppinsText weight='medium'>
                    Page {page.pageNumber}
                </PoppinsText>
                <PoppinsText>{page.title || `Page ${page.pageNumber}`}</PoppinsText>
                <PoppinsText varient='subtext'>
                    {page.imageUrl ? 'Image attached' : 'No image yet'}
                </PoppinsText>
            </Column>
        </TouchableOpacity>
    );
};

export default PageListItem;
