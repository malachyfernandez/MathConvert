import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { ScrollShadow } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import { SearchField } from 'heroui-native';
import { useUserListSet } from 'hooks/useUserListSet';
import { useListSearch } from 'hooks/useListSearch';
import { MathDocument, MathDocumentPage } from 'types/mathDocuments';
import DocumentCard from './DocumentCard';
import NewDocumentDialog from './NewDocumentDialog';
import { FileText } from 'lucide-react-native';

interface DocumentHomePageProps {
    userId: string;
    setActiveDocumentId: (documentId: string) => void;
}

const DocumentHomePage = ({ userId, setActiveDocumentId }: DocumentHomePageProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const scopedUserIds = userId ? [userId] : ['__loading__'];
    const setDocument = useUserListSet<MathDocument>();
    
    // Use the new generic search hook
    const { items: documents, additionalItems, isLoading, hasResults, resultCount } = useListSearch<MathDocument>({
        searchQuery,
        userIds: scopedUserIds,
        searchKey: 'mathDocuments',
        additionalKeys: ['mathDocumentPages'],
    });

    // Extract pages from additional items
    const pages = additionalItems?.[0] as MathDocumentPage[] | undefined;

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
            <Column className='flex-1 items-center justify-center p-8'>
                <Column className='rounded-3xl border-2 border-border bg-inner-background p-8 items-center' gap={3}>
                    <FileText size={48} className="text-accent" />
                    <PoppinsText weight='bold' className='text-2xl text-center'>Loading your workspace</PoppinsText>
                    <PoppinsText className='text-center text-subtext'>Syncing your account…</PoppinsText>
                </Column>
            </Column>
        );
    }

    return (
        <Column className='flex-1' gap={6}>
            {/* Header Section */}
            <Column className='max-w-[800px] w-full mx-auto px-4' gap={4}>
                {/* Search Bar */}
                <SearchField value={searchQuery} onChange={setSearchQuery}>
                    <SearchField.Group>
                        <SearchField.SearchIcon />
                        <SearchField.Input 
                            placeholder="Search documents..."
                            className="border border-subtle-border bg-inner-background rounded-xl focus:outline-none"
                        />
                        <SearchField.ClearButton />
                    </SearchField.Group>
                </SearchField>
                
                {/* Create Document Button */}
                <NewDocumentDialog onCreate={setActiveDocumentId} buttonVariant='green' />
            </Column>

            {/* Documents List */}
            <ScrollShadow LinearGradientComponent={LinearGradient} className='flex-1'>
                <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                    <Column gap={4} className='pb-8 max-w-[800px] w-full mx-auto px-4'>
                        {hasResults ? (
                            <>
                                {searchQuery && (
                                    <PoppinsText varient='subtext' className='px-2'>
                                        Found {resultCount} document{resultCount !== 1 ? 's' : ''} matching "{searchQuery}"
                                    </PoppinsText>
                                )}
                                {documents?.map((document) => (
                                    <DocumentCard
                                        key={document.id}
                                        document={document}
                                        pageCount={pages?.filter((page) => page.documentId === document.id).length ?? 0}
                                        onPress={() => void openDocument(document)}
                                    />
                                ))}
                            </>
                        ) : (
                            <Column className='rounded-2xl border border-subtle-border bg-inner-background p-8 items-center' gap={3}>
                                <FileText size={48} className="text-subtext" />
                                <PoppinsText weight='bold' className='text-xl text-center'>
                                    {searchQuery ? 'No documents found' : 'No documents yet'}
                                </PoppinsText>
                                <PoppinsText className='text-center text-subtext'>
                                    {searchQuery 
                                        ? `Try adjusting your search for "${searchQuery}"`
                                        : 'Create your first document to start converting handwritten math to LaTeX.'
                                    }
                                </PoppinsText>
                            </Column>
                        )}
                    </Column>
                </ScrollView>
            </ScrollShadow>
        </Column>
    );
};

export default DocumentHomePage;
