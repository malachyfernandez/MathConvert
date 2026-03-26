import React, { useState } from 'react';
import { View } from 'react-native';
import Column from '../layout/Column';
import { MathDocumentPage } from 'types/mathDocuments';
import ImageDisplay from './ImageDisplay';
import NoImageDisplay from './NoImageDisplay';
import ImageUrlModal from './ImageUrlModal';

interface ImageColumnProps {
    page: MathDocumentPage | null;
    onImageChange: (url: string) => void;
}

const ImageColumn = ({ page, onImageChange }: ImageColumnProps) => {
    const [isImageUrlModalOpen, setIsImageUrlModalOpen] = useState(false);

    const handleImageUrlAccept = (url: string) => {
        onImageChange(url);
    };

    return (
        <View className={page?.imageUrl ? 'flex-1 border-r border-subtle-border' : 'w-full'}>
            {page?.imageUrl ? (
                <ImageDisplay
                    page={page}
                    onImageUrlModalOpen={() => setIsImageUrlModalOpen(true)}
                    onImageChange={onImageChange}
                />
            ) : (
                <NoImageDisplay
                    page={page}
                    onImageUrlModalOpen={() => setIsImageUrlModalOpen(true)}
                    onImageChange={onImageChange}
                />
            )}
            
            <ImageUrlModal
                isOpen={isImageUrlModalOpen}
                onOpenChange={setIsImageUrlModalOpen}
                onAccept={handleImageUrlAccept}
            />
        </View>
    );
};

export default ImageColumn;
