import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { Spinner } from 'heroui-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import { MonoIconsOptionsHorizontal } from '../icons/MonoIconsOptionsHorizontal';
import { MathDocumentPage } from 'types/mathDocuments';
import { useGeneration } from '../../../contexts/GenerationContext';

interface PageListItemProps {
    page: MathDocumentPage;
    isActive: boolean;
    onPress: () => void;
    onConfigure?: () => void;
}

const PageListItem = ({ page, isActive, onPress, onConfigure }: PageListItemProps) => {
    const { isPageGenerating, isPageRecentlyCompleted, clearRecentlyCompleted } = useGeneration();
    const isGenerating = isPageGenerating(page.id);
    const isRecentlyCompleted = isPageRecentlyCompleted(page.id);

    // Helper function to render page title with number
    const renderPageTitle = (title: string, pageNumber: number) => {
        return `${title} - ${pageNumber}`;
    };

    const handlePress = () => {
        // Clear recently completed status when user interacts with the page
        if (isRecentlyCompleted) {
            clearRecentlyCompleted(page.id);
        }
        
        if (isActive && onConfigure) {
            onConfigure();
        } else {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.85}
            className={`rounded-xl border p-3 ${isActive ? 'border-primary-accent bg-primary-accent/10' : 'border-subtle-border bg-inner-background'}`}
        >
            <Row className='items-center justify-between'>
                <Column gap={1} className='flex-1'>
                    <PoppinsText weight='medium'>
                        {renderPageTitle(page.title || 'Page', page.pageNumber)}
                    </PoppinsText>
                </Column>
                {isGenerating ? (
                    <Spinner size="sm" color="primary" />
                ) : isRecentlyCompleted ? (
                    <Image 
                        source={require('../../../assets/svgs/check-mark.svg')}
                        className='w-5 h-5 text-primary'
                        style={{ tintColor: '#3B82F6' }}
                    />
                ) : (
                    isActive && onConfigure && (
                        <MonoIconsOptionsHorizontal className='text-text opacity-50' width={20} height={20} />
                    )
                )}
            </Row>
        </TouchableOpacity>
    );
};

export default PageListItem;
