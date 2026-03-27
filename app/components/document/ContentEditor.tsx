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

    // Parse line into segments with syntax highlighting
    const parseLineWithHighlighting = (line: string): Array<{text: string, color: string}> => {
        const segments: Array<{text: string, color: string}> = [];
        let currentIndex = 0;
        
        // Helper functions
        const isHeaderLine = (text: string): boolean => {
            return /^#{1,6}\s/.test(text);
        };

        const isListItem = (text: string): boolean => {
            return /^\s*[-*+]\s|^\s*\d+\.\s/.test(text);
        };
        
        // Regex to find LaTeX content (inline math, display math, and commands)
        const latexRegex = /(\$[^$\n]*\$|\\[a-zA-Z]+(?:\{[^}]*\}|_\{[^}]*\}|\^{[^}]*\})?|\\begin\{[^}]+\}|\\end\{[^}]+\})/g;
        let match;
        
        while ((match = latexRegex.exec(line)) !== null) {
            // Add text before LaTeX match
            if (match.index > currentIndex) {
                const beforeText = line.substring(currentIndex, match.index);
                if (beforeText) {
                    segments.push({
                        text: beforeText,
                        color: isHeaderLine(beforeText.trim()) ? '#059669' : 
                               isListItem(beforeText.trim()) ? '#DC2626' : '#1F2937'
                    });
                }
            }
            
            // Add LaTeX content
            const latexContent = match[0];
            segments.push({
                text: latexContent,
                color: '#8B5CF6' // Purple for LaTeX
            });
            
            currentIndex = match.index + latexContent.length;
        }
        
        // Add remaining text after last LaTeX match
        if (currentIndex < line.length) {
            const remainingText = line.substring(currentIndex);
            if (remainingText) {
                segments.push({
                    text: remainingText,
                    color: isHeaderLine(remainingText.trim()) ? '#059669' : 
                           isListItem(remainingText.trim()) ? '#DC2626' : '#1F2937'
                });
            }
        }
        
        // If no LaTeX found, check for headers/lists on the whole line
        if (segments.length === 0) {
            segments.push({
                text: line,
                color: isHeaderLine(line) ? '#059669' : 
                       isListItem(line) ? '#DC2626' : '#1F2937'
            });
        }
        
        return segments.length > 0 ? segments : [{text: line || ' ', color: '#1F2937'}];
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
                                <View key={index} className='flex-row flex-wrap' style={{ minHeight: 24 }}>
                                    {parseLineWithHighlighting(line).map((segment, segIndex) => (
                                        <Text
                                            key={segIndex}
                                            className='text-base'
                                            style={{
                                                color: segment.color,
                                                lineHeight: 24,
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            {segment.text}
                                        </Text>
                                    ))}
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ContentEditor;
