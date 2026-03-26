import React from 'react';
import { View, Image } from 'react-native';
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
            <Image
                source={{ uri: page.imageUrl }}
                className='w-full h-full'
                resizeMode='contain'
            />
            <View className='absolute bottom-0 left-0 right-0 p-4 pt-12 bg-linear-to-t from-background to-transparent'>
                <Row gap={2}>
                    <View className='flex-1'>
                        <AppButton
                            variant='outline-alt'
                            className='h-12 w-full'
                            onPress={onImageUrlModalOpen}
                        >
                            <PoppinsText weight='medium'>Use Image URL</PoppinsText>
                        </AppButton>
                    </View>
                    <View className='flex-1'>
                        <SimpleImageUpload
                            url={page.imageUrl}
                            setUrl={(nextUrl: string | ((previousValue: string) => string)) => {
                                if (typeof nextUrl === 'string') {
                                    onImageChange(nextUrl);
                                }
                            }}
                            buttonLabel='Change Image'
                            emptyLabel='Upload page image'
                            className='w-full'
                        />
                    </View>
                </Row>
            </View>
        </View>
    );
};

export default ImageDisplay;
