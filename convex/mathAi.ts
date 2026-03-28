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
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is missing from the Convex environment. Run `npx convex env set OPENAI_API_KEY <your_key>` or add it in the Convex dashboard for this deployment.');
        }


        const prompt = buildPrompt(args);

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
            max_completion_tokens: 2000,
            reasoning_effort: 'low',
        };


        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });


            if (!response.ok) {
                const errorText = await response.text();
                console.error('OpenAI Error Response:', errorText);
                throw new Error(`OpenAI request failed: ${errorText}`);
            }

            const json = await response.json();

            // Extract markdown from chat completions response
            const markdown = json.choices?.[0]?.message?.content?.trim() || '';


            if (!markdown) {
                    throw new Error('OpenAI returned an empty response.');
            }


            return {
                markdown,
            };
        } catch (error) {
            throw error;
        }
    },
});
