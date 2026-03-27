import React from 'react';
import { ScrollView } from 'react-native';
import { ScrollShadow } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { useUserListGet } from 'hooks/useUserListGet';
import { useUserListSet } from 'hooks/useUserListSet';
import { MathDocument, MathDocumentPage } from 'types/mathDocuments';
import DocumentCard from './DocumentCard';
import NewDocumentDialog from './NewDocumentDialog';

interface DocumentHomePageProps {
    userId: string;
    setActiveDocumentId: (documentId: string) => void;
}

const DocumentHomePage = ({ userId, setActiveDocumentId }: DocumentHomePageProps) => {
    const scopedUserIds = userId ? [userId] : ['__loading__'];
    const setDocument = useUserListSet<MathDocument>();
    const documents = useUserListGet<MathDocument>({
        key: 'mathDocuments',
        userIds: scopedUserIds,
    });
    const pages = useUserListGet<MathDocumentPage>({
        key: 'mathDocumentPages',
        userIds: scopedUserIds,
    });

    const openDocument = async (document: MathDocument) => {
        await setDocument({
            key: 'mathDocuments',
            itemId: document.id,
            value: {
                ...document,
                lastOpenedAt: Date.now(),
            },
            privacy: 'PUBLIC',
            searchKeys: ['title', 'description'],
            sortKey: 'lastOpenedAt',
        });

        setActiveDocumentId(document.id);
    };

    if (!userId) {
        return (
            <Column className='flex-1 full rounded-3xl border-2 border-border bg-inner-background p-6' gap={2}>
                <PoppinsText weight='bold' className='text-2xl'>MathConvert</PoppinsText>
                <PoppinsText>Syncing your account…</PoppinsText>
            </Column>
        );
    }

    return (
        <Column className='flex-1' gap={4}>
            <Column className='max-w-[800px] w-full mx-auto' gap={3}>
                <PoppinsText weight='bold' className='text-3xl'>MathConvert</PoppinsText>
                
                <NewDocumentDialog onCreate={setActiveDocumentId} />
            </Column>

            <ScrollShadow LinearGradientComponent={LinearGradient} className='flex-1'>
                <ScrollView className='flex-1'>
                    <Column gap={3} className='pb-8 max-w-[800px] w-full mx-auto'>
                        {documents && documents.length > 0 ? (
                            documents.map((document) => (
                                <DocumentCard
                                    key={document.itemId ?? document.value.id}
                                    document={document.value}
                                    pageCount={pages?.filter((page) => page.value.documentId === document.value.id).length ?? 0}
                                    onPress={() => void openDocument(document.value)}
                                />
                            ))
                        ) : (
                            <Column className='rounded-2xl border border-subtle-border bg-inner-background p-6' gap={2}>
                                <PoppinsText weight='bold' className='text-xl'>No documents yet</PoppinsText>
                                <PoppinsText>Create documents to convert handwritten math to LaTeX.</PoppinsText>
                            </Column>
                        )}
                    </Column>
                </ScrollView>
            </ScrollShadow>
        </Column>
    );
};

export default DocumentHomePage;
