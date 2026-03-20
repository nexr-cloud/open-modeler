import type { UIMessage } from "ai";
import { z } from "zod";

// --- Message Metadata ---
export const messageMetadataSchema = z.object({
    createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

// --- Custom UI Data Types ---
export type CustomUIDataTypes = {
    textDelta: string;
    appendMessage: string;
    id: string;
    title: string;
    clear: null;
    finish: null;
};

// --- Tools used in this app ---
// No dynamic tools registered — tools are defined inline in the API route
export type ChatTools = Record<string, never>;

// --- Convenience Chat Message type ---
export type ChatMessage = UIMessage<MessageMetadata, CustomUIDataTypes, ChatTools>;

// --- Attachment ---
export type Attachment = {
    name: string;
    url: string;
    contentType: string;
};

// --- Part Schemas ---

const textPartSchema = z.object({
    type: z.literal("text"),
    text: z.string().min(1),
    state: z.string().optional(),
}).catchall(z.any());

const reasoningPartSchema = z.object({
    type: z.literal("reasoning"),
    text: z.string(),
    state: z.string().optional(),
    providerMetadata: z.record(z.string(), z.any()).optional(),
}).catchall(z.any());

const filePartSchema = z.object({
    type: z.literal("file"),
    mediaType: z.string(),
    name: z.string().min(1).max(100),
    url: z.string().url(),
}).catchall(z.any());

const stepStartPartSchema = z.object({
    type: z.literal("step-start"),
}).catchall(z.any());

const dataUsagePartSchema = z.object({
    type: z.literal("data-usage"),
    data: z.object({
        inputTokens: z.number(),
        outputTokens: z.number().optional(),
        totalTokens: z.number(),
        reasoningTokens: z.number().optional(),
        cachedInputTokens: z.number().optional(),
        context: z.record(z.string(), z.any()).optional(),
        costUSD: z.record(z.string(), z.any()).optional(),
        modelId: z.string(),
    }).catchall(z.any()),
});

// Generic tool call part (covers tool-xxx types from AI SDK)
const toolCallPartSchema = z.object({
    type: z.string().regex(/^tool-.+/),
    toolCallId: z.string().optional(),
    state: z.string().optional(),
    input: z.record(z.string(), z.any()).optional(),
    output: z.any().optional(),
    approval: z.any().optional(),
}).catchall(z.any());

// Union of all part types
const partSchema = z.union([
    textPartSchema,
    reasoningPartSchema,
    filePartSchema,
    stepStartPartSchema,
    dataUsagePartSchema,
    toolCallPartSchema,
]);

// --- Request Body Schema ---
export const postRequestBodySchema = z.object({
    id: z.string(),
    messages: z.array(
        z.object({
            id: z.string(),
            role: z.enum(["user", "assistant", "system", "tool"]),
            parts: z.array(partSchema),
        }).catchall(z.any())
    ),
    apiKey: z.string().optional(),
    provider: z.string().optional(),
    modelId: z.string().optional(),
}).catchall(z.any());

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
export type Part = z.infer<typeof partSchema>;