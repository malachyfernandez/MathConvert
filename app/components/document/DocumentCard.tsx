import React from 'react';
import { TouchableOpacity } from 'react-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import { MathDocument } from 'types/mathDocuments';
import { FileText, Calendar, ChevronRight } from 'lucide-react-native';

interface DocumentCardProps {
    document: MathDocument;
    pageCount: number;
    onPress: () => void;
}

const DocumentCard = ({ document, pageCount, onPress }: DocumentCardProps) => {
    const lastOpenedLabel = new Date(document.lastOpenedAt).toLocaleDateString();

    return (
        <TouchableOpacity 
            onPress={onPress} 
            activeOpacity={0.85} 
            className='w-full rounded-2xl border border-subtle-border bg-inner-background p-5 shadow-sm'
        >
            <Row className='items-center justify-between'>
                <Column className='flex-1 gap-2'>
                    <Row className='items-center gap-2'>
                        <FileText size={18} className="text-accent" />
                        <PoppinsText weight='bold' className='text-xl flex-1'>
                            {document.title}
                        </PoppinsText>
                    </Row>
                    
                    {document.description && (
                        <PoppinsText className='text-subtext ml-6'>{document.description}</PoppinsText>
                    )}
                    
                    <Row className='items-center gap-4 ml-6'>
                        <Row className='items-center gap-1'>
                            <FileText size={14} className="text-subtext" />
                            <PoppinsText varient='subtext'>
                                {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                            </PoppinsText>
                        </Row>
                        
                        <Row className='items-center gap-1'>
                            <Calendar size={14} className="text-subtext" />
                            <PoppinsText varient='subtext'>Last opened {lastOpenedLabel}</PoppinsText>
                        </Row>
                    </Row>
                </Column>
                
                <ChevronRight size={20} className="text-subtext" />
            </Row>
        </TouchableOpacity>
    );
};

export default DocumentCard;
