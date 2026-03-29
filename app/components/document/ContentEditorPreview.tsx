import React, { useState, useRef, useEffect } from 'react';
import { LayoutChangeEvent, View, Text, ScrollView, Platform } from 'react-native';

interface ContentEditorPreviewProps {
    text: string;
    headerHeight?: number;
    footerHeight?: number;
}

const ContentEditorPreview = ({ text, headerHeight = 0, footerHeight = 0 }: ContentEditorPreviewProps) => {
    const [lines, setLines] = useState<string[]>(() => text.split('\n'));
    const scrollViewRef = useRef<ScrollView>(null);
    const [renderedContentHeight, setRenderedContentHeight] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const renderedContentHeightRef = useRef(0);
    const containerHeightRef = useRef(0);

    const lineHeight = 24;
    const editorPadding = 16;
    const minimumEditorHeight = lineHeight * 10 + editorPadding * 2;
    const editorHeight = Math.max(renderedContentHeight + editorPadding * 2, containerHeight, minimumEditorHeight);

    // Shared text style for perfect alignment
    const editorTextStyle = {
        fontFamily: Platform.select({
            ios: 'Menlo',
            android: 'monospace',
            web: 'monospace',
            default: 'monospace',
        }),
        fontSize: 16,
        lineHeight,
        fontWeight: '400' as const,
        includeFontPadding: false,
    };

    // Update lines when text changes externally
    useEffect(() => {
        const newLines = text.split('\n');
        setLines(newLines);
    }, [text]);

    // Types and constants for stateful parser
type Segment = { text: string; color: string };
type ParserState = { closingDelimiter: string } | null;

const LATEX_COLOR = '#8B5CF6';
const HEADER_COLOR = '#059669';
const LIST_COLOR = '#DC2626';
const TEXT_COLOR = '#1F2937';

const isHeaderLine = (text: string): boolean => /^#{1,6}\s/.test(text);

const isListItem = (text: string): boolean =>
  /^\s*[-*+]\s|^\s*\d+\.\s/.test(text);

const getBaseColor = (line: string): string =>
  isHeaderLine(line)
    ? HEADER_COLOR
    : isListItem(line)
      ? LIST_COLOR
      : TEXT_COLOR;

const isEscaped = (text: string, index: number): boolean => {
  let backslashCount = 0;

  for (let i = index - 1; i >= 0 && text[i] === '\\'; i--) {
    backslashCount++;
  }

  return backslashCount % 2 === 1;
};

const findUnescapedSingleDollar = (
  text: string,
  fromIndex: number
): number => {
  let index = text.indexOf('$', fromIndex);

  while (index !== -1) {
    const isDoubleDollar = text[index - 1] === '$' || text[index + 1] === '$';

    if (!isEscaped(text, index) && !isDoubleDollar) {
      return index;
    }

    index = text.indexOf('$', index + 1);
  }

  return -1;
};

const findUnescapedDoubleDollar = (
  text: string,
  fromIndex: number
): number => {
  let index = text.indexOf('$$', fromIndex);

  while (index !== -1) {
    if (!isEscaped(text, index)) {
      return index;
    }

    index = text.indexOf('$$', index + 2);
  }

  return -1;
};

type LatexStart =
  | { index: number; type: 'paren' }
  | { index: number; type: 'bracket' }
  | { index: number; type: 'doubleDollar' }
  | { index: number; type: 'singleDollar' }
  | { index: number; type: 'begin'; env: string; raw: string }
  | { index: number; type: 'command'; raw: string };

const findNextLatexStart = (
  line: string,
  fromIndex: number
): LatexStart | null => {
  const candidates: LatexStart[] = [];

  const parenIndex = line.indexOf('\\(', fromIndex);
  if (parenIndex !== -1) {
    candidates.push({ index: parenIndex, type: 'paren' });
  }

  const bracketIndex = line.indexOf('\\[', fromIndex);
  if (bracketIndex !== -1) {
    candidates.push({ index: bracketIndex, type: 'bracket' });
  }

  const doubleDollarIndex = findUnescapedDoubleDollar(line, fromIndex);
  if (doubleDollarIndex !== -1) {
    candidates.push({ index: doubleDollarIndex, type: 'doubleDollar' });
  }

  const singleDollarIndex = findUnescapedSingleDollar(line, fromIndex);
  if (singleDollarIndex !== -1) {
    candidates.push({ index: singleDollarIndex, type: 'singleDollar' });
  }

  const beginRegex = /\\begin\{([^}]+)\}/g;
  beginRegex.lastIndex = fromIndex;
  const beginMatch = beginRegex.exec(line);

  if (beginMatch) {
    candidates.push({
      index: beginMatch.index,
      type: 'begin',
      env: beginMatch[1],
      raw: beginMatch[0],
    });
  }

  const commandRegex =
    /\\[a-zA-Z]+(?:\{[^}]*\}|_\{[^}]*\}|\^\{[^}]*\})?/g;
  commandRegex.lastIndex = fromIndex;
  const commandMatch = commandRegex.exec(line);

  if (commandMatch) {
    candidates.push({
      index: commandMatch.index,
      type: 'command',
      raw: commandMatch[0],
    });
  }

  if (candidates.length === 0) {
    return null;
  }

  const priority: Record<LatexStart['type'], number> = {
    paren: 0,
    bracket: 0,
    doubleDollar: 0,
    singleDollar: 0,
    begin: 1,
    command: 2,
  };

  candidates.sort(
    (a, b) => a.index - b.index || priority[a.type] - priority[b.type]
  );

  return candidates[0];
};

const findClosingDelimiter = (
  line: string,
  closingDelimiter: string,
  fromIndex: number
): number => {
  if (closingDelimiter === '$$') {
    return findUnescapedDoubleDollar(line, fromIndex);
  }

  if (closingDelimiter === '$') {
    return findUnescapedSingleDollar(line, fromIndex);
  }

  return line.indexOf(closingDelimiter, fromIndex);
};

const createLineParser = () => {
  let state: ParserState = null;

  return (line: string): Segment[] => {
    const segments: Segment[] = [];
    const baseColor = getBaseColor(line);
    let cursor = 0;

    const pushPlain = (text: string): void => {
      if (text) {
        segments.push({ text, color: baseColor });
      }
    };

    const pushLatex = (text: string): void => {
      if (text) {
        segments.push({ text, color: LATEX_COLOR });
      }
    };

    if (state) {
      const endIndex = findClosingDelimiter(line, state.closingDelimiter, 0);

      if (endIndex === -1) {
        return [{ text: line || ' ', color: LATEX_COLOR }];
      }

      const end = endIndex + state.closingDelimiter.length;
      pushLatex(line.slice(0, end));
      cursor = end;
      state = null;
    }

    while (cursor < line.length) {
      const next = findNextLatexStart(line, cursor);

      if (!next) {
        pushPlain(line.slice(cursor));
        break;
      }

      if (next.index > cursor) {
        pushPlain(line.slice(cursor, next.index));
      }

      if (next.type === 'command') {
        pushLatex(next.raw);
        cursor = next.index + next.raw.length;
        continue;
      }

      let closingDelimiter = '';
      let tokenLength = 0;

      switch (next.type) {
        case 'paren':
          closingDelimiter = '\\)';
          tokenLength = 2;
          break;
        case 'bracket':
          closingDelimiter = '\\]';
          tokenLength = 2;
          break;
        case 'doubleDollar':
          closingDelimiter = '$$';
          tokenLength = 2;
          break;
        case 'singleDollar':
          closingDelimiter = '$';
          tokenLength = 1;
          break;
        case 'begin':
          closingDelimiter = `\\end{${next.env}}`;
          tokenLength = next.raw.length;
          break;
      }

      const endIndex = findClosingDelimiter(
        line,
        closingDelimiter,
        next.index + tokenLength
      );

      if (endIndex === -1) {
        pushLatex(line.slice(next.index));
        state = { closingDelimiter };
        cursor = line.length;
        break;
      }

      const end = endIndex + closingDelimiter.length;
      pushLatex(line.slice(next.index, end));
      cursor = end;
    }

    if (segments.length === 0) {
      segments.push({
        text: line || ' ',
        color: state ? LATEX_COLOR : baseColor,
      });
    }

    return segments;
  };
};

    // Create parser instance for this component
    const parseLineWithHighlighting = createLineParser();

    const handleContainerLayout = (nextHeight: number) => {
        if (Math.abs(containerHeightRef.current - nextHeight) < 1) {
            return;
        }

        containerHeightRef.current = nextHeight;
        setContainerHeight(nextHeight);
    };

    const handleRenderedContentLayout = (event: LayoutChangeEvent) => {
        const nextHeight = event.nativeEvent.layout.height;

        if (Math.abs(renderedContentHeightRef.current - nextHeight) < 1) {
            return;
        }

        renderedContentHeightRef.current = nextHeight;
        setRenderedContentHeight(nextHeight);
    };

    return (
        <View
            className='flex-1 bg-background rounded-lg overflow-hidden'
            onLayout={(event) => handleContainerLayout(event.nativeEvent.layout.height)}
        >
            <ScrollView
                ref={scrollViewRef}
                className='flex-1'
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ 
                    flexGrow: 1,
                    paddingTop: headerHeight,
                    paddingBottom: footerHeight
                }}
            >
                <View className='relative' style={{ minHeight: editorHeight }}>
                    {/* Static visual display with syntax highlighting */}
                    <View className='absolute inset-0'>
                        <View
                            className='relative'
                            style={{
                                padding: editorPadding,
                                minHeight: editorHeight,
                            }}
                        >
                            <View onLayout={handleRenderedContentLayout}>
                                {lines.map((line: string, index: number) => {
                                    const segments = parseLineWithHighlighting(line);

                                    return (
                                        <View key={index} style={{ minHeight: lineHeight }}>
                                            <Text style={editorTextStyle}>
                                                {segments.length > 0 ? (
                                                    segments.map((segment: Segment, segIndex: number) => (
                                                        <Text
                                                            key={segIndex}
                                                            style={[editorTextStyle, { color: segment.color }]}
                                                        >
                                                            {segment.text || ' '}
                                                        </Text>
                                                    ))
                                                ) : (
                                                    <Text style={[editorTextStyle, { color: TEXT_COLOR }]}>{' '}</Text>
                                                )}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default ContentEditorPreview;
