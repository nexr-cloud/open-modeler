import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UIMessage, UIMessagePart } from "ai";
import type { ChatTools, CustomUIDataTypes, PostRequestBody } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function convertRequestMessagesToUIMessages(
  messages: PostRequestBody['messages']
): UIMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as UIMessage['role'],
    parts: message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
  }));
}

/**
 * Robustly parses architecture generation results from tool call outputs
 */
export function parseArchitectureData(resultRaw: any) {
  if (!resultRaw) return null;
  const data = { ...(resultRaw?.architecture || resultRaw) };

  if (data && typeof data.architectureJson === 'string') {
    let rawJson = data.architectureJson.trim();

    // Remove markdown code blocks if present
    if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      data.architectureJson = JSON.parse(rawJson);
    } catch (e) {
      try {
        // Fix trailing commas which LLMs often include
        const fixedJson = rawJson.replace(/,(\s*[\]}])/g, '$1');
        data.architectureJson = JSON.parse(fixedJson);
      } catch (innerError) {
        data.architectureJson = null;
      }
    }
  }

  return {
    title: data.title || "Architecture",
    architectureJson: data.architectureJson
  };
}

/**
 * Truncates a project title to a specified length with an ellipsis
 */
export function truncateProjectTitle(title: string | null | undefined, limit: number = 40): string | null {
  if (!title) return null;
  return title.length > limit ? `${title.substring(0, limit)}...` : title;
}
/**
 * Simple obfuscation to prevent plain-text API keys from showing up in local storage inspections.
 * NOT a replacement for true server-side encryption, but provides a basic level of privacy
 * for local-first architectural tools.
 */
const SALT = "nexr-modeler-salt-2025-sec-obs";

export function conceal(text: string): string {
  if (!text) return "";
  try {
    // Simple XOR-like transformation + Base64
    const result = text.split("").map((char, j) =>
      String.fromCharCode(char.charCodeAt(0) ^ SALT.charCodeAt(j % SALT.length))
    ).join("");
    return btoa(result);
  } catch (e) {
    return text;
  }
}

export function reveal(encoded: string): string {
  if (!encoded) return "";
  try {
    const decoded = atob(encoded);
    return decoded.split("").map((char, j) =>
      String.fromCharCode(char.charCodeAt(0) ^ SALT.charCodeAt(j % SALT.length))
    ).join("");
  } catch (e) {
    return encoded;
  }
}
