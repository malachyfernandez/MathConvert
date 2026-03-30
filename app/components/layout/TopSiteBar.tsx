import React from 'react';
import Column from './Column';
import Row from './Row';
import AppButton from '../ui/buttons/AppButton';
import ShareButton from '../ui/buttons/ShareButton';
import PoppinsText from '../ui/text/PoppinsText';
import { UserIcon } from '../ui/icons/UserIcon';
import { TouchableOpacity } from 'react-native';
import UserProfileDialog from '../dialog/UserProfileDialog';
import { useUserList } from 'hooks/useUserList';
import { useUserListGet } from 'hooks/useUserListGet';
import { useUserVariable } from 'hooks/useUserVariable';
import { MathDocument, MathDocumentPage } from 'types/mathDocuments';
import DocumentDetails from '../document/DocumentDetails';

interface TopSiteBarProps {
    className?: string;
    isInDocument?: boolean;
    onHomePress: () => void;
    documentId?: string;
    userId?: string;
}

const TopSiteBar = ({ className = '', isInDocument, onHomePress, documentId, userId }: TopSiteBarProps) => {
    const [documentRecord] = useUserList<MathDocument>({
        key: 'mathDocuments',
        itemId: documentId || '',
    });

    // Get active page ID (same logic as DocumentEditorPage)
    const [activePageId] = useUserVariable<string>({
        key: "activePage",
        defaultValue: "",
    });

    // Get pages for this document (same logic as DocumentEditor)
    const scopedUserIds = userId ? [userId] : ['__loading__'];
    const pages = useUserListGet<MathDocumentPage>({
        key: 'mathDocumentPages',
        filterFor: documentId || '',
        userIds: scopedUserIds,
    }) ?? [];

    // Find active page (same logic as DocumentEditor line 35)
    const activePage = pages.find((page) => page.value.id === activePageId.value)?.value || null;

    return (
        <Column className={className}>
            <Row className='justify-between items-center h-24 px-4'>
                <Row className='items-center flex-1'>
                    <TouchableOpacity onPress={onHomePress}>
                        <PoppinsText weight='bold' className='text-lg'>{isInDocument ? '<' : 'Paper'}</PoppinsText>
                    </TouchableOpacity>
                    {isInDocument && documentRecord.value && (
                        <>
                            <DocumentDetails document={documentRecord.value} onDelete={onHomePress} />

                        </>
                    )}


                </Row>
                <Row gap={6} className='items-center'>
                    {isInDocument && documentRecord.value && activePage && (
                        <Row className='border-r border-subtle-border pr-6 h-14 items-center'>
                            <ShareButton
                                documentTitle={documentRecord.value.title}
                                documentId={documentId!}
                                activePage={activePage}
                            />
                        </Row>
                    )}

                    <UserProfileDialog>
                        <AppButton variant="outline-alt" className="h-14 w-14">
                            <UserIcon size={24} />
                        </AppButton>
                    </UserProfileDialog>
                </Row>
            </Row>
        </Column>
    );
};

export default TopSiteBar;
