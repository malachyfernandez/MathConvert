import React, { useState } from 'react';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import AppButton from '../ui/buttons/AppButton';
import PublicImageUpload from '../ui/imageUpload/PublicImageUpload';
import SimpleImageUploadButton from './SimpleImageUploadButton';
import { MathDocumentPage } from 'types/mathDocuments';

interface NoImageDisplayProps {
    page: MathDocumentPage | null;
    onImageUrlModalOpen: () => void;
    onImageChange: (url: string) => void;
}

const NoImageDisplay = ({ page, onImageUrlModalOpen, onImageChange }: NoImageDisplayProps) => {
    const [showFullUpload, setShowFullUpload] = useState(false);

    return (
        <Column className='flex-1 items-center justify-center p-8' gap={4}>
            <PoppinsText weight='bold' className='text-xl'>No image uploaded</PoppinsText>
            <PoppinsText>Upload an image or use a URL to get started with math conversion.</PoppinsText>
            
            {showFullUpload ? (
                <PublicImageUpload
                    url={page?.imageUrl || ''}
                    setUrl={(nextUrl: string | ((previousValue: string) => string)) => {
                        if (typeof nextUrl === 'string' && page) {
                            onImageChange(nextUrl);
                            setShowFullUpload(false);
                        }
                    }}
                    buttonLabel='Upload Image'
                    emptyLabel='Upload page image'
                />
            ) : (
                <Row gap={2}>
                    <AppButton 
                        variant='outline-alt' 
                        className='h-12 px-4' 
                        onPress={onImageUrlModalOpen}
                    >
                        <PoppinsText weight='medium'>Use Image URL</PoppinsText>
                    </AppButton>
                    <SimpleImageUploadButton onPress={() => setShowFullUpload(true)} />
                </Row>
            )}
        </Column>
    );
};

export default NoImageDisplay;
