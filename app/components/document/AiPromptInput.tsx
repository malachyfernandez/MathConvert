import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Spinner } from 'heroui-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import { MathDocumentPage } from 'types/mathDocuments';

interface AiPromptInputProps {
    page: MathDocumentPage;
    prompt: string;
    onPromptChange: (prompt: string) => void;
    onSubmit: () => void;
    isGenerating?: boolean;
}

const AiPromptInput = ({ page, prompt, onPromptChange, onSubmit, isGenerating }: AiPromptInputProps) => {
    return (
        <Column gap={2}>
            <Row className='' gap={2}>
                <PoppinsTextInput
                    value={prompt}
                    onChangeText={onPromptChange}
                    placeholder={page.markdown 
                        ? 'Problem 4 is a matrix not a . . .'
                        : 'Describe how to convert this math...'
                    }
                    className='flex-1 border border-subtle-border bg-background p-3 min-h-32'
                    multiline={true}
                    autoGrow={true}
                    submitBehavior="submit"
                    onSubmitEditing={onSubmit}
                />
                
                <TouchableOpacity 
                    onPress={onSubmit}
                    disabled={isGenerating}
                    className={`w-12 h-12 rounded-lg items-center justify-center ${
                        isGenerating ? 'bg-gray-400' : 'bg-primary-accent'
                    }`}
                >
                    {isGenerating ? (
                        <Spinner size="sm" color="white" />
                    ) : (
                        <Image 
                            source={require('../../../assets/svgs/sendSVG-white.svg')}
                            className='w-5 h-5'
                            resizeMode='contain'
                        />
                    )}
                </TouchableOpacity>
            </Row>
        </Column>
    );
};

export default AiPromptInput;
