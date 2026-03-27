import React from 'react';
import Column from './Column';
import Row from './Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import { UserIcon } from '../ui/icons/UserIcon';
import { TouchableOpacity } from 'react-native';
import UserProfileDialog from '../dialog/UserProfileDialog';

interface TopSiteBarProps {
    className?: string;
    isInDocument?: boolean;
    onHomePress: () => void;
}

const TopSiteBar = ({ className = '', isInDocument, onHomePress }: TopSiteBarProps) => {
    return (
        <Column className={className}>
            <Row className='justify-between items-center h-24 px-4'>
                <TouchableOpacity onPress={onHomePress}>
                    <PoppinsText weight='bold' className='text-lg'>{isInDocument ? '< MathConvert' : 'MathConvert'}</PoppinsText>
                </TouchableOpacity>
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
