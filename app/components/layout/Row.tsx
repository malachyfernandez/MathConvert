import React, { PropsWithChildren } from 'react';
import { View, ViewStyle } from 'react-native';

interface RowProps extends PropsWithChildren {
    className?: string;
    gap?: number;
    pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
    onLayout?: (event: any) => void;
    style?: ViewStyle;
}

const Row = ({ children, className, gap = 4, pointerEvents, onLayout, style }: RowProps) => {
    return (
        <View className={`flex-row ${className}`} style={{ gap: gap * 4, ...style }} pointerEvents={pointerEvents} onLayout={onLayout}>
            {children}
        </View>
    );
};

export default Row;
