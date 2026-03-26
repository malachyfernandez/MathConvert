import React from 'react';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';

interface SimpleImageUploadButtonProps {
    onPress: () => void;
    disabled?: boolean;
}

const SimpleImageUploadButton = ({ onPress }: SimpleImageUploadButtonProps) => {
    return (
        <AppButton 
            variant='green' 
            className='h-12 px-5' 
            onPress={onPress}
        >
            <PoppinsText weight='medium' color='white'>Upload Image</PoppinsText>
        </AppButton>
    );
};

export default SimpleImageUploadButton;
