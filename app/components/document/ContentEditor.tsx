import React, { useState, useRef, useEffect } from 'react';
import { TextInput, View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import PoppinsText from '../ui/text/PoppinsText';

interface ContentEditorProps {
    markdown: string;
    onChange: (markdown: string) => void;
}

const ContentEditor = ({ markdown, onChange }: ContentEditorProps) => {
    const [lines, setLines] = useState<string[]>(() => markdown.split('\n'));
    const [isFocused, setIsFocused] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const textInputRef = useRef<TextInput>(null);

    // Update lines when markdown changes externally
    useEffect(() => {
        const newLines = markdown.split('\n');
        setLines(newLines);
    }, [markdown]);

    // Detect LaTeX content in a line
    const isLatexLine = (line: string): boolean => {
        return /\$.*\$|\\[a-zA-Z]+|\\begin\{|\\end\{|\\[a-zA-Z]+\{.*\}/.test(line);
    };

    // Detect markdown headers
    const isHeaderLine = (line: string): boolean => {
        return /^#{1,6}\s/.test(line);
    };

    // Detect markdown list items
    const isListItem = (line: string): boolean => {
        return /^\s*[-*+]\s|^\s*\d+\.\s/.test(line);
    };

    // Get syntax highlighting color for a line
    const getLineColor = (line: string): string => {
        if (isLatexLine(line)) return '#8B5CF6'; // Purple for LaTeX
        if (isHeaderLine(line)) return '#059669'; // Green for headers
        if (isListItem(line)) return '#DC2626'; // Red for lists
        return '#1F2937'; // Default gray
    };

    // Handle text changes
    const handleTextChange = (text: string) => {
        const newLines = text.split('\n');
        setLines(newLines);
        onChange(text);
    };

    // Handle focus
    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className='flex-1'
        >
            <View className='flex-1 border border-subtle-border bg-background rounded-lg overflow-hidden'>
                <ScrollView
                    ref={scrollViewRef}
                    className='flex-1'
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                >
                    <View className='flex-1 p-4 relative'>
                        {/* Hidden text input for actual editing */}
                        <TextInput
                            ref={textInputRef}
                            value={markdown}
                            onChangeText={handleTextChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder='Your markdown and LaTeX will appear here...'
                            placeholderTextColor='transparent'
                            multiline={true}
                            autoCapitalize='none'
                            autoCorrect={false}
                            spellCheck={false}
                            selectionColor='rgba(59, 130, 246, 0.3)'
                            className='absolute inset-0 p-4'
                            style={{
                                fontFamily: 'monospace',
                                lineHeight: 24,
                                color: 'transparent', // Text completely transparent
                                backgroundColor: 'transparent',
                                textAlignVertical: 'top',
                                // Web-only cursor color (ignores TypeScript error)
                                ...(Platform.OS === 'web' && { caretColor: '#000' }),
                            }}
                        />

                        {/* Visual display with syntax highlighting */}
                        <View 
                            className='relative'
                            style={{ 
                                minHeight: 24 * Math.max(lines.length, 10),
                            }}
                            pointerEvents='none'
                        >
                            {lines.map((line, index) => (
                                <Text
                                    key={index}
                                    className='text-base'
                                    style={{
                                        color: getLineColor(line),
                                        lineHeight: 24,
                                        fontFamily: 'monospace',
                                        minHeight: 24,
                                    }}
                                >
                                    {line || ' '}
                                </Text>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ContentEditor;
