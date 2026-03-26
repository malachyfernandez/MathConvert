import React from 'react';
import { ScrollView } from 'react-native';
import { ScrollShadow } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { MathDocumentPage } from 'types/mathDocuments';
import MathPageWorkspace from './MathPageWorkspace';

interface DocumentContentProps {
    documentTitle: string;
    activePage: MathDocumentPage;
    onReplacePage: (nextPage: MathDocumentPage, description: string) => void;
    onDeletePage: (pageId: string) => void;
}

const DocumentContent = ({ documentTitle, activePage, onReplacePage, onDeletePage }: DocumentContentProps) => {
    return (
        <ScrollView className='flex-1'>
            <ScrollShadow LinearGradientComponent={LinearGradient} className='flex-1'>
                <MathPageWorkspace
                    documentTitle={documentTitle}
                    page={activePage}
                    onReplacePage={onReplacePage}
                    onDeletePage={onDeletePage}
                />
            </ScrollShadow>
        </ScrollView>
    );
};

export default DocumentContent;
