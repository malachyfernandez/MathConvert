import React from 'react';
import { Image, View } from 'react-native';
import PoppinsText from '../ui/text/PoppinsText';

interface PageThumbnailProps {
    imageUrl?: string;
    className?: string;
}

const PageThumbnail = ({ imageUrl, className = 'w-36 h-24' }: PageThumbnailProps) => {
    return (
        <View className={`${className} rounded-lg border border-subtle-border bg-inner-background overflow-hidden ml-3`}>
            {imageUrl ? (
                <View className='w-full h-full overflow-hidden'>
                    <Image
                        source={{ uri: imageUrl }}
                        className='w-full h-auto'
                        style={{ 
                            height: '200%', // Double the height
                            transform: [{ translateY: '0%' }] // Show top 50%
                        }}
                        resizeMode='cover'
                    />
                </View>
            ) : (
                <View className='w-full h-full items-center justify-center'>
                    <PoppinsText varient='subtext' className='text-xs text-center'>No image</PoppinsText>
                </View>
            )}
        </View>
    );
};

export default PageThumbnail;
