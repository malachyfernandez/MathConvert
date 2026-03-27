import React from 'react';
import { Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ViewOnlyDocumentScreen from '../../components/mathDocuments/ViewOnlyDocumentScreen';

const ViewOnlyDocumentRoute = () => {
    const { documentId } = useLocalSearchParams<{ documentId?: string }>();

    // For non-web platforms, we still render the screen to show the unsupported message
    return <ViewOnlyDocumentScreen documentId={documentId ?? ''} />;
};

export default ViewOnlyDocumentRoute;
