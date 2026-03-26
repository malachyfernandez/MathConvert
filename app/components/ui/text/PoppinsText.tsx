import React, { PropsWithChildren } from 'react';
import { Text, TextStyle } from 'react-native';
import { useFonts } from 'expo-font';

type FontWeight = 'regular' | 'medium' | 'bold';
type PoppinsTextVarient = 'default' | 'heading' | 'subtext' | 'cardHeader';
type TextColor = 'black' | 'white' | 'red';

interface PoppinsTextProps extends PropsWithChildren {
    className?: string;
    weight?: FontWeight;
    varient?: PoppinsTextVarient;
    color?: TextColor;
    style?: TextStyle;
}

const PoppinsText = ({
    children,
    className = '',
    weight = 'regular',
    varient = 'default',
    color = 'black',
    style
}: PoppinsTextProps) => {
    const [fontsLoaded] = useFonts({
        'Poppins-Regular': require('../../../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../../../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-Bold': require('../../../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    });



    if (varient === 'subtext') {
        className += ' text-sm opacity-50';
    }

    if (varient === 'cardHeader') {
        className += ' text-xs opacity-50 uppercase tracking-wider';
    }

    if (!fontsLoaded) {
        return <Text className={`text-white ${className}`}>{children}</Text>;
    }

    const getFontFamily = () => {
        switch (weight) {
            case 'medium':
                return 'Poppins-Medium';
            case 'bold':
                return 'Poppins-Bold';
            default:
                return 'Poppins-Regular';
        }
    };

    const tailwindColor = color === 'black' ? 'text-text' : color === 'red' ? 'text-red-500' : 'text-white';

    return (
        <Text
            className={`${tailwindColor} ${className}`}
            style={{ fontFamily: getFontFamily(), ...style }}
        >
            {children}
        </Text>
    );
};

export default PoppinsText;
