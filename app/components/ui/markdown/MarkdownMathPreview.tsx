import React from 'react';
import { ScrollView, View } from 'react-native';
import Column from '../../layout/Column';
import PoppinsText from '../text/PoppinsText';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownMathPreviewProps {
    markdown: string;
    className?: string;
}

const MarkdownMathPreview = ({ markdown, className = '' }: MarkdownMathPreviewProps) => {
    return (
        <View className={`min-h-72 rounded-xl border border-subtle-border bg-inner-background ${className}`}>
            <ScrollView className='h-full'>
                <Column className='p-4' gap={3}>
                    <PoppinsText varient='subtext'>LaTeX preview uses the full MathJax renderer on web. Native currently shows the markdown source layout.</PoppinsText>
                    <MarkdownRenderer markdown={markdown} />
                </Column>
            </ScrollView>
        </View>
    );
};

export default MarkdownMathPreview;
