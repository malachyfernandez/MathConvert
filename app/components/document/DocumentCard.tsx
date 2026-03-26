import React from 'react';
import { TouchableOpacity } from 'react-native';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { MathDocument } from 'types/mathDocuments';

interface DocumentCardProps {
    document: MathDocument;
    pageCount: number;
    onPress: () => void;
}

const DocumentCard = ({ document, pageCount, onPress }: DocumentCardProps) => {
    const lastOpenedLabel = new Date(document.lastOpenedAt).toLocaleDateString();

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85} className='w-full rounded-2xl border-2 border-border bg-inner-background p-5'>
            <Column gap={2}>
                <PoppinsText weight='bold' className='text-xl'>
                    {document.title}
                </PoppinsText>
                <PoppinsText>{document.description || 'No description yet.'}</PoppinsText>
                <PoppinsText varient='subtext'>
                    {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                </PoppinsText>
                <PoppinsText varient='subtext'>Last opened {lastOpenedLabel}</PoppinsText>
            </Column>
        </TouchableOpacity>
    );
};

export default DocumentCard;
