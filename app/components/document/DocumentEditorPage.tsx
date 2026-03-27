import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { MathDocument, MathDocumentPage } from 'types/mathDocuments';
import DocumentSidebar from './DocumentSidebar';
import DocumentEditor from './DocumentEditor';
import NewPageDialog from './NewPageDialog';

interface DocumentEditorPageProps {
    documentId: string;
    userId: string;
}

const DocumentEditorPage = ({ documentId, userId }: DocumentEditorPageProps) => {
    const [activePageId, setActivePageId] = useState('');

    return (
        <View className='flex-1'>
            {/* This will be handled by DocumentEditor component */}
            <View className={'flex-1 flex-row'}>
                <DocumentSidebar
                    documentId={documentId}
                    userId={userId}
                    activePageId={activePageId}
                    onSetActivePageId={setActivePageId}
                />
                <DocumentEditor
                    documentId={documentId}
                    userId={userId}
                    activePageId={activePageId}
                    onSetActivePageId={setActivePageId}
                />
            </View>
        </View>
    );
};

export default DocumentEditorPage;
