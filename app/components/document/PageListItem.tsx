import React from 'react';
import { TouchableOpacity } from 'react-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import { MonoIconsOptionsHorizontal } from '../icons/MonoIconsOptionsHorizontal';
import { MathDocumentPage } from 'types/mathDocuments';

interface PageListItemProps {
    page: MathDocumentPage;
    isActive: boolean;
    onPress: () => void;
    onConfigure?: () => void;
}

const PageListItem = ({ page, isActive, onPress, onConfigure }: PageListItemProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className={`rounded-xl border p-3 ${isActive ? 'border-primary-accent bg-primary-accent/10' : 'border-subtle-border bg-inner-background'}`}
        >
            <Row className='items-center justify-between'>
                <Column gap={1} className='flex-1'>
                    <PoppinsText weight='medium'>
                        Page {page.pageNumber}
                    </PoppinsText>
                    <PoppinsText>{page.title || `Page ${page.pageNumber}`}</PoppinsText>
                    <PoppinsText varient='subtext'>
                        {page.imageUrl ? 'Image attached' : 'No image yet'}
                    </PoppinsText>
                </Column>
                {onConfigure && (
                    <TouchableOpacity
                        onPress={(event) => {
                            event.stopPropagation();
                            onConfigure();
                        }}
                        className='p-2'
                    >
                        <MonoIconsOptionsHorizontal className='text-text opacity-50' width={20} height={20} />
                    </TouchableOpacity>
                )}
            </Row>
        </TouchableOpacity>
    );
};

export default PageListItem;
