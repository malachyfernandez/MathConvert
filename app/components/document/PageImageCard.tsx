import React, { useState } from 'react';
import { Image as RNImage, Platform } from 'react-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import PublicImageUpload from '../ui/imageUpload/PublicImageUpload';

interface PageImageCardProps {
    imageUrl: string;
    onChangeImageUrl: (url: string) => void;
}

const waitForImageUrl = async (url: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        await new Promise<void>((resolve, reject) => {
            const image = new window.Image();
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('The image URL could not be loaded.'));
            image.src = url;
        });
        return;
    }

    await new Promise<void>((resolve, reject) => {
        RNImage.getSize(
            url,
            () => resolve(),
            () => reject(new Error('The image URL could not be loaded.')),
        );
    });
};

const PageImageCard = ({ imageUrl, onChangeImageUrl }: PageImageCardProps) => {
    const [externalUrl, setExternalUrl] = useState('');
    const [isLoadingExternalUrl, setIsLoadingExternalUrl] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleUseExternalUrl = async () => {
        if (!externalUrl.trim()) {
            setErrorMessage('Enter an image URL first.');
            return;
        }

        try {
            setIsLoadingExternalUrl(true);
            setErrorMessage('');
            await waitForImageUrl(externalUrl.trim());
            onChangeImageUrl(externalUrl.trim());
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'The image URL could not be loaded.');
        } finally {
            setIsLoadingExternalUrl(false);
        }
    };

    return (
        <Column className='rounded-2xl border-2 border-border bg-inner-background p-4' gap={3}>
            <PoppinsText weight='bold' varient='cardHeader'>Page image</PoppinsText>
            <PoppinsText varient='subtext'>Upload from your device or paste a direct image URL. The URL is checked before it is saved.</PoppinsText>

            <PublicImageUpload
                url={imageUrl}
                setUrl={(nextUrl: string | ((previousValue: string) => string)) => {
                    if (typeof nextUrl === 'string') {
                        onChangeImageUrl(nextUrl);
                    }
                }}
                buttonLabel='Upload page image'
                emptyLabel='No page image uploaded yet.'
            />

            <Column gap={2}>
                <PoppinsText weight='medium'>Use image URL</PoppinsText>
                <PoppinsTextInput
                    value={externalUrl}
                    onChangeText={setExternalUrl}
                    placeholder='https://example.com/handwritten-math.jpg'
                    autoCapitalize='none'
                    autoCorrect={false}
                    className='w-full border border-subtle-border bg-background p-3'
                />
                <Row gap={2} className='items-center'>
                    <AppButton variant='green' className='h-11 px-4' onPress={() => void handleUseExternalUrl()}>
                        <PoppinsText weight='medium' color='white'>
                            {isLoadingExternalUrl ? 'Checking URL...' : 'Use URL'}
                        </PoppinsText>
                    </AppButton>
                    {imageUrl ? (
                        <PoppinsText varient='subtext'>Current image is ready for AI conversion.</PoppinsText>
                    ) : null}
                </Row>
                {errorMessage ? <PoppinsText className='text-red-500'>{errorMessage}</PoppinsText> : null}
            </Column>
        </Column>
    );
};

export default PageImageCard;
