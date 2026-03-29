declare const process: {
    env: Record<string, string | undefined>;
};

import { v } from 'convex/values';
import { action } from './_generated/server';

const getOutputText = (response: any) => {
    if (typeof response.output_text === 'string' && response.output_text.trim().length > 0) {
        return response.output_text.trim();
    }

    if (!Array.isArray(response.output)) {
        return '';
    }

    const parts: string[] = [];

    for (const item of response.output) {
        if (!Array.isArray(item?.content)) {
            continue;
        }

        for (const contentItem of item.content) {
            if (contentItem?.type === 'output_text' && typeof contentItem.text === 'string') {
                parts.push(contentItem.text);
            }
        }
    }

    return parts.join('\n').trim();
};

const buildPrompt = ({
    guidance,
    currentMarkdown,
    followUpPrompt,
    documentTitle,
    pageTitle,
}: {
    guidance?: string;
    currentMarkdown?: string;
    followUpPrompt?: string;
    documentTitle?: string;
    pageTitle?: string;
}) => {
    const promptParts = [
        'You are converting a handwritten math page into accessible markdown with LaTeX.',
        'Return only the final markdown document.',
        'Use standard markdown for prose and lists.',
        'Use LaTeX for all mathematical notation.',
        'Do not wrap the final answer in code fences.',
        'If handwriting is ambiguous, make the best reasonable interpretation and preserve any uncertainty in natural language inside the markdown.',
    ];

    if (documentTitle) {
        promptParts.push(`The document title is "${documentTitle}".`);
    }

    if (pageTitle) {
        promptParts.push(`The page title is "${pageTitle}".`);
    }

    if (guidance && guidance.trim().length > 0) {
        promptParts.push(`The user has given the guidence of "${guidance.trim()}".`);
    }

    if (currentMarkdown && currentMarkdown.trim().length > 0) {
        promptParts.push('The current markdown document is below. Use it as the current source of truth before applying edits.');
        promptParts.push(currentMarkdown.trim());
    }

    if (followUpPrompt && followUpPrompt.trim().length > 0) {
        promptParts.push(`The user follow-up adjustment prompt is "${followUpPrompt.trim()}".`);
    } else {
        promptParts.push('This is the initial conversion request for the uploaded image.');
    }

    return promptParts.join('\n\n');
};

export const convertMathImageToMarkdown = action({
    args: {
        imageUrl: v.string(),
        guidance: v.optional(v.string()),
        currentMarkdown: v.optional(v.string()),
        followUpPrompt: v.optional(v.string()),
        documentTitle: v.optional(v.string()),
        pageTitle: v.optional(v.string()),
    },
    handler: async (_ctx, args) => {
        console.log('=== CONVERT MATH IMAGE TO MARKDOWN START ===');
        console.log('INPUT ARGS:', JSON.stringify(args, null, 2));

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.error('OPENAI_API_KEY is missing');
            throw new Error('OPENAI_API_KEY is missing from the Convex environment. Run `npx convex env set OPENAI_API_KEY <your_key>` or add it in the Convex dashboard for this deployment.');
        }

        const prompt = buildPrompt(args);
        console.log('GENERATED PROMPT:', prompt);
        console.log('IMAGE URL:', args.imageUrl);

        const requestBody = {
            model: 'gpt-5.4-nano',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt,
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: args.imageUrl,
                            },
                        },
                    ],
                },
            ],
            max_completion_tokens: 4000,
            reasoning_effort: 'low',
        };

        console.log('OPENAI REQUEST BODY:', JSON.stringify(requestBody, null, 2));

        try {
            console.log('SENDING REQUEST TO OPENAI...');
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('OPENAI RESPONSE STATUS:', response.status);
            console.log('OPENAI RESPONSE HEADERS:', {
                'content-type': response.headers.get('content-type'),
                'openai-version': response.headers.get('openai-version'),
                'openai-organization': response.headers.get('openai-organization'),
                'openai-processing-ms': response.headers.get('openai-processing-ms'),
                'openai-request-id': response.headers.get('openai-request-id'),
                'x-ratelimit-limit-requests': response.headers.get('x-ratelimit-limit-requests'),
                'x-ratelimit-limit-tokens': response.headers.get('x-ratelimit-limit-tokens'),
                'x-ratelimit-remaining-requests': response.headers.get('x-ratelimit-remaining-requests'),
                'x-ratelimit-remaining-tokens': response.headers.get('x-ratelimit-remaining-tokens'),
                'x-ratelimit-reset-requests': response.headers.get('x-ratelimit-reset-requests'),
                'x-ratelimit-reset-tokens': response.headers.get('x-ratelimit-reset-tokens'),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('OPENAI ERROR RESPONSE:', errorText);
                throw new Error(`OpenAI request failed: ${errorText}`);
            }

            const json = await response.json();
            console.log('OPENAI RESPONSE JSON:', JSON.stringify(json, null, 2));

            // Extract markdown from chat completions response
            const markdown = json.choices?.[0]?.message?.content?.trim() || '';
            console.log('EXTRACTED MARKDOWN:', markdown);
            console.log('MARKDOWN LENGTH:', markdown.length);

            if (!markdown) {
                console.error('EMPTY MARKDOWN EXTRACTED FROM RESPONSE');
                console.log('FULL RESPONSE STRUCTURE:', JSON.stringify(json, null, 2));
                throw new Error('OpenAI returned an empty response.');
            }

            console.log('=== CONVERT MATH IMAGE TO MARKDOWN SUCCESS ===');
            return {
                markdown,
            };
        } catch (error) {
            console.error('=== CONVERT MATH IMAGE TO MARKDOWN ERROR ===');
            console.error('ERROR TYPE:', typeof error);
            console.error('ERROR MESSAGE:', error instanceof Error ? error.message : String(error));
            console.error('ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace');
            throw error;
        }
    },
});
