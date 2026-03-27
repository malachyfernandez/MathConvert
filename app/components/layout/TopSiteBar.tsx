import React from 'react';
import Column from './Column';
import Row from './Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import { UserIcon } from '../ui/icons/UserIcon';
import { TouchableOpacity } from 'react-native';
import UserProfileDialog from '../dialog/UserProfileDialog';
import { useUserList } from 'hooks/useUserList';
import { MathDocument } from 'types/mathDocuments';
import DocumentDetails from '../document/DocumentDetails';

interface TopSiteBarProps {
    className?: string;
    isInDocument?: boolean;
    onHomePress: () => void;
    documentId?: string;
}

const TopSiteBar = ({ className = '', isInDocument, onHomePress, documentId }: TopSiteBarProps) => {
    const [documentRecord] = useUserList<MathDocument>({
        key: 'mathDocuments',
        itemId: documentId || '',
    });

    return (
        <Column className={className}>
            <Row className='justify-between items-center h-24 px-4'>
                <Row className='items-center'>
                    <TouchableOpacity onPress={onHomePress}>
                        <PoppinsText weight='bold' className='text-lg'>{isInDocument ? '<' : 'MathConvert'}</PoppinsText>
                    </TouchableOpacity>
                    {isInDocument && documentRecord.value && (
                        <DocumentDetails document={documentRecord.value} />
                    )}
                </Row>
                <UserProfileDialog>
                    <AppButton variant="outline-alt" className="h-14 w-14">
                        <UserIcon size={24} />
                    </AppButton>
                </UserProfileDialog>
            </Row>
        </Column>
    );
};

export default TopSiteBar;
