import React from 'react';
import { View } from 'react-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import AppButton from '../ui/buttons/AppButton';
import SimpleImageUpload from './SimpleImageUpload';
import { MathDocumentPage } from 'types/mathDocuments';

interface ImageDisplayProps {
    page: MathDocumentPage;
    onImageUrlModalOpen: () => void;
    onImageChange: (url: string) => void;
}

const ImageDisplay = ({ page, onImageUrlModalOpen, onImageChange }: ImageDisplayProps) => {
    return (
        <View className='flex-1 relative'>
            <img 
                src={page.imageUrl} 
                alt="Page image" 
                className='w-full h-full object-contain'
            />
            <View className='absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/50 to-transparent'>
                <Row gap={2}>
                    <AppButton 
                        variant='outline-alt' 
                        className='h-12 px-5 flex-1' 
                        onPress={onImageUrlModalOpen}
                    >
                        <PoppinsText weight='medium'>Use Image URL</PoppinsText>
                    </AppButton>
                    <SimpleImageUpload
                        url={page.imageUrl}
                        setUrl={(nextUrl: string | ((previousValue: string) => string)) => {
                            if (typeof nextUrl === 'string') {
                                onImageChange(nextUrl);
                            }
                        }}
                        buttonLabel='Change Image'
                        emptyLabel='Upload page image'
                    />
                </Row>
            </View>
        </View>
    );
};

export default ImageDisplay;
