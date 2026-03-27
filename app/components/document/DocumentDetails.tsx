import React, { useState } from 'react';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { TouchableOpacity } from 'react-native';
import EditDocumentDialog from './EditDocumentDialog';
import { MathDocument } from 'types/mathDocuments';

interface DocumentDetailsProps {
    document: MathDocument;
}

const DocumentDetails = ({ document }: DocumentDetailsProps) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    return (
        <>
            {/* <Column className='rounded-2xl border-2 border-border bg-inner-background p-4' gap={3}> */}
                <TouchableOpacity onPress={() => setIsEditDialogOpen(true)}>
                    <Column gap={3}>
                        {/* <PoppinsText weight='bold' varient='cardHeader'>Details</PoppinsText> */}
                        <Column className='rounded-lg border border-subtle-border bg-inner-background px-3 h-14 w-64 justify-center   ' gap={0}>
                            <PoppinsText weight='medium' className='text-text opacity-70'>
                                {document.title || 'Untitled math document'}
                            </PoppinsText>
                            <PoppinsText varient='subtext' weight='regular'>
                                {document.description || 'No description yet.'}
                            </PoppinsText>
                        </Column>
                    </Column>
                </TouchableOpacity>
            {/* </Column> */}
            <EditDocumentDialog
                document={document}
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />
        </>
    );
};

export default DocumentDetails;
