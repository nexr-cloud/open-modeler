import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import {
    streamText,
    UIMessage,
    convertToModelMessages,
    tool,
    smoothStream,
    stepCountIs
} from "ai";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/system-prompt";
import { z } from "zod";
import { PostRequestBody, postRequestBodySchema } from "@/lib/types";
import { convertRequestMessagesToUIMessages } from "@/lib/utils";
import { ChatSDKError } from "@/lib/errors";

export const maxDuration = 30;

export async function POST(req: Request) {
    let requestBody: PostRequestBody;

    try {
        const json = await req.json();
        console.log("Raw Request JSON:", JSON.stringify(json, null, 2));
        requestBody = postRequestBodySchema.parse(json);
    } catch (_) {
        return new ChatSDKError("bad_request:api").toResponse();
    }

    try {
        let uiMessages: UIMessage[] = convertRequestMessagesToUIMessages(requestBody.messages);

        const { provider, modelId, apiKey } = requestBody;

        console.log("Chat Request Logic:", { provider, modelId, hasApiKey: !!apiKey });

        let modelInstance: any; // Need specific provider return type or 'any' if mixed?
        // Actually, AI-SDK models usually inherit from 'LanguageModel'
        // But 'any' is common for mixed provider results in early stages.

        if (!apiKey) {
            return new ChatSDKError("unauthorized:api", "Missing API key in request body").toResponse();
        }

        if (provider === 'anthropic') {
            const anthropicProvider = createAnthropic({ apiKey });
            modelInstance = anthropicProvider(modelId || "claude-opus-4-6");
        } else if (provider === 'google') {
            const googleProvider = createGoogleGenerativeAI({ apiKey });
            modelInstance = googleProvider(modelId || "gemini-2.5-computer-use-preview-10-2025");
        } else if (provider === 'openai') {
            const openaiProvider = createOpenAI({ apiKey });
            modelInstance = openaiProvider(modelId || "gpt-4.1-2025-04-14");
        } else {
            // Fallback to Anthropic env key if exists, but we said no project keys
            return new Response("No valid provider/key configuration found in request", { status: 400 });
        }

        const result = streamText({
            model: modelInstance,
            messages: await convertToModelMessages(uiMessages),
            system: DEFAULT_SYSTEM_PROMPT + "\n\nCRITICAL FLOW: You must never call 'generate_architecture' directly in your first design phase. You MUST first call 'request_architecture_approval' with a title and summary. Only after the user approves that tool call should you proceed to call 'generate_architecture' with the full JSON payload. This saves tokens and respects the user's process.\n\nWhen a tool execution is not approved by the user, do not retry it. Inform the user that the action was not performed and ask if they would like to try a different approach.",
            stopWhen: stepCountIs(10),
            tools: {
                request_architecture_approval: tool({
                    description: "Request user permission to generate a detailed SAP architecture diagram. Call this FIRST with a summary before the full JSON generation.",
                    inputSchema: z.object({
                        title: z.string().describe("The planned title of the architecture"),
                        summary: z.string().describe("Brief summary of what services and layers will be included.")
                    }),
                    needsApproval: true,
                    execute: async (args) => {
                        return {
                            approved: true,
                            message: `User approved the proposal for "${args.title}". Please proceed with calling generate_architecture now.`
                        };
                    }
                }),
                generate_architecture: tool({
                    description: "Generate the full structured SAP architecture JSON. Only call this AFTER 'request_architecture_approval' is successful.",
                    inputSchema: z.object({
                        title: z.string().describe("Title of the architecture"),
                        architectureJson: z.any().describe("The full structured architecture JSON mapping all layers and connections.")
                    }),
                    execute: async (args) => {
                        return {
                            success: true,
                            architecture: args
                        };
                    }
                }),
            },
            experimental_transform: smoothStream(),
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("Assistant API Error Detail:", error);
        return new ChatSDKError("bad_request:api", error.message || "Internal Server Error").toResponse();
    }
}