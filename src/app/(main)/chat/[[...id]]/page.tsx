"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  RiLoader2Line, RiSparklingFill
} from "react-icons/ri";
import { Message, MessageBranch, MessageBranchContent, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useChat } from "@ai-sdk/react";
import { useSidebar } from "@/components/ui/sidebar";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses } from 'ai';
import { Check, X, ShieldCheck, PanelRightOpen, Sparkles, ExternalLink } from "lucide-react";
import { useCallback, useMemo, useState, use, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { parseArchitectureData } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCreateProject, useMessages, useCreateMessage } from "@/queries/project.query";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import ArchitectureCanvasWithEditor from "@/components/architecture/architecture-canvas-with-editor";
import Logo from "@/components/global-components/logo";
import { PiCubeTransparentFill } from "react-icons/pi";
import { useSettingsStore } from "@/stores/settings.store";
import { useUIStore } from "@/stores/ui.store";
import { sanitizeErrorMessage } from "@/lib/errors";

const suggestions = [
  "I need a mobile app with backend integration to SAP S/4HANA",
  "Design an analytics dashboard with real-time data processing",
  "Create an integration hub for multiple cloud systems",
  "Build a workflow automation solution with approvals"
];


const SuggestionItem = ({
  suggestion,
  onClick,
}: {
  suggestion: string;
  onClick: (suggestion: string) => void;
}) => {
  return (
    <button
      onClick={() => onClick(suggestion)}
      className="group relative flex flex-col items-start text-left p-6 rounded-2xl border border-border/40 bg-sidebar hover:bg-sidebar/40 hover:border-primary/30 transition-all duration-300 hover:shadow hover:shadow-primary/5 active:scale-[0.98]"
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <RiSparklingFill className="size-4 text-primary/40" />
      </div>
      <p className="text-[13px] leading-relaxed text-muted-foreground font-medium pr-6 group-hover:text-foreground transition-colors">
        "{suggestion}"
      </p>
    </button>
  );
};

const EmptyChatState = ({ onSuggestionClick }: { onSuggestionClick: (s: string) => void }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Logo />
      {/* Text Content */}
      <div className="text-center mt-10 space-y-4 max-w-2xl mb-12">
        <h1 className="text-3xl font-sans font-bold tracking-tight text-foreground sm:text-4xl">
          Start Your <span className="text-primary font-serif">Architecture</span> Journey
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed font-medium px-4">
          Tell me about your business requirements, integration needs, or technical challenges.
          I'll help you design a comprehensive <span className="text-foreground font-serif font-semibold">SAP BTP architecture diagram</span>.
        </p>
      </div>

      {/* Grid of Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
        {suggestions.map((suggestion) => (
          <SuggestionItem
            key={suggestion}
            onClick={onSuggestionClick}
            suggestion={suggestion}
          />
        ))}
      </div>

      {/* Enterprise CTA - Trust Building */}
      <div className="mt-16 flex flex-col items-center gap-6 text-center max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">

        <div className="group cursor-pointer" onClick={() => window.open('https://nexr.cloud/', '_blank')}>
          <div className="flex items-center gap-3 py-1.5 px-3 rounded-full bg-primary/5 border border-primary/10 hover:border-primary/20 ">
            <Sparkles className="size-4 text-primary animate-pulse" />
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-xs font-medium text-primary flex items-center gap-1.5 leading-none">
                Scale Your Enterprise with NEXr Cloud <ExternalLink className="size-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage({ params }: { params: Promise<{ id?: string[] }> }) {
  const resolvedParams = use(params);
  const chatId = resolvedParams.id?.[0];
  const router = useRouter();
  const { setOpen } = useSidebar();

  const { data: storedMessages } = useMessages(chatId);
  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: createMessage } = useCreateMessage();

  const [input, setInput] = useState('');
  const [activeArchId, setActiveArchId] = useState<string | null>(null);
  const { apiKey, selectedProvider, selectedModel } = useSettingsStore();
  const { setIsSettingsDialogOpen: setIsDialogOpen, setSettingsActiveTab: setActiveTab } = useUIStore();

  const transport = useMemo(() => new DefaultChatTransport({
    prepareSendMessagesRequest: ({ id, messages }) => {
      // Access store state directly to ensure we have the absolute latest REVEALED key
      const { apiKey: currentKey, selectedProvider: currentProvider, selectedModel: currentModel } = useSettingsStore.getState();

      return {
        body: {
          id,
          messages: messages.map((m) => ({
            id: m.id,
            role: m.role,
            parts: m.parts,
          })),
          apiKey: currentKey,
          provider: currentProvider,
          modelId: currentModel,
        },
      };
    },
  }), []); // Empty deps because we read state dynamically inside the function

  const { messages, setMessages, status: chatStatus, sendMessage, addToolApprovalResponse } = useChat({
    id: chatId,
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    onError: (error) => {
      console.error("Chat error:", error);
      const isApiKeyError = error.message?.toLowerCase().includes("api key") ||
        error.message?.toLowerCase().includes("required");

      const cleanMessage = sanitizeErrorMessage(error.message);

      if (isApiKeyError) {
        toast.error("API Key is missing. Please configure it in Settings.");
        setActiveTab("account");
        setIsDialogOpen(true);
      } else {
        toast.error(cleanMessage || "An error occurred during generation.");
      }
    },
    onFinish: (data) => {
      if (chatId) {
        const assistantParts = data?.message?.parts;
        if (!assistantParts || assistantParts.length === 0) return;

        // Skip saving if it's ONLY a tool call that is still waiting for approval
        // This prevents "bridge" turns from cluttering the database which causes duplicates on refresh
        const hasText = assistantParts.some((p) => p.type === 'text' && p.text?.trim().length > 0);
        const hasResult = assistantParts.some((p: any) =>
          p.type === 'tool-result' ||
          p.result ||
          p.toolInvocation?.result ||
          p.state === 'output-available' ||
          p.output
        );
        const isWaitingForApproval = assistantParts.some((p: any) =>
          p.type === 'tool-approval-request' ||
          (p.type === 'tool-call' && !p.result && !p.toolInvocation?.result) ||
          p.state === 'approval-requested' ||
          (p.type && p.type.startsWith('tool-') && !p.output && !p.result)
        );

        if (isWaitingForApproval && !hasText && !hasResult) {
          console.log("Skipping DB save for intermediate tool approval state");
          return;
        }

        createMessage({
          id: data.message.id, // Use the SDK's message ID for upserting
          projectId: chatId,
          role: data.message.role,
          parts: assistantParts,
        });
      }
    }
  });

  // Derived: All architectures generated in this conversation
  const allArchitectures = useMemo(() => {
    const results: { id: string; title: string; architectureJson: any }[] = [];
    messages.forEach((m: any) => {
      m.parts?.forEach((p: any, idx: number) => {
        const toolName = p.type?.startsWith('tool-') ? p.type.replace('tool-', '') : p.toolName;
        if (toolName === 'generate_architecture') {
          const isReady = p.state === 'output-available' || p.state === 'result' || p.result;
          if (isReady) {
            const resultRaw = p.output || p.result;
            const parsed = parseArchitectureData(resultRaw);

            if (parsed?.architectureJson) {
              results.push({
                id: p.toolCallId || `${m.id}-${idx}`,
                title: parsed.title,
                architectureJson: parsed.architectureJson
              });
            }
          }
        }
      });
    });
    return results;
  }, [messages]);

  const selectedArchIndex = useMemo(() => {
    if (!activeArchId) return 0;
    const idx = allArchitectures.findIndex(a => a.id === activeArchId);
    return idx === -1 ? 0 : idx;
  }, [allArchitectures, activeArchId]);

  const isPanelOpen = activeArchId !== null;

  // Sync sidebars: Close project sidebar when diagram opens
  useEffect(() => {
    if (isPanelOpen) {
      setOpen(false);
    }
  }, [isPanelOpen]);

  // Sync stored messages into useChat when they load (Pure parts approach)
  useEffect(() => {
    if (storedMessages && storedMessages.length > 0 && messages.length === 0) {
      setMessages(storedMessages.map(m => ({
        id: m.id,
        role: m.role,
        parts: m.parts,
        createdAt: new Date(m.createdAt),
      })) as any);
    }
  }, [storedMessages, setMessages, messages.length]);

  // Handle message carry-over from home to chat route
  useEffect(() => {
    if (chatId && (!storedMessages || storedMessages.length === 0) && chatStatus !== 'streaming') {
      const persistedPrompt = sessionStorage.getItem('pendingPrompt');
      if (persistedPrompt) {
        sessionStorage.removeItem('pendingPrompt');
        sendMessage({ text: persistedPrompt });
      }
    }
  }, [chatId, storedMessages, chatStatus, sendMessage]);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      try {
        const text = message.text || input;
        const hasText = Boolean(text);
        const hasAttachments = Boolean(message.files?.length);

        if (!(hasText || hasAttachments)) {
          return;
        }

        // If it's a new project (no chatId), create one and redirect
        if (!chatId) {
          sessionStorage.setItem('pendingPrompt', text);
          const project = await createProject({ title: text.slice(0, 30) || "New Conversation" });

          // Save the first user message using parts only
          await createMessage({
            projectId: project.id,
            role: "user",
            parts: [{ type: "text", text: text }]
          });

          router.push(`/chat/${project.id}`);
          return;
        }

        // Persist user message for existing project
        await createMessage({
          projectId: chatId,
          role: "user",
          parts: [{ type: "text", text: text }]
        });

        sendMessage({ text });
        setInput('');
      } catch (error: any) {
        console.error("Submission error:", error);
        toast.error(error.message || "Failed to send message. Please try again.");
      }
    },
    [sendMessage, input, chatId, createProject, createMessage, router]
  );

  const isWaitingForApproval = useMemo(() => {
    return messages.some((m) =>
      m.parts?.some((p: any) => p.state === 'approval-requested')
    );
  }, [messages]);

  const isSubmitDisabled = useMemo(
    () => !(input) || chatStatus === "streaming" || isWaitingForApproval,
    [input, chatStatus, isWaitingForApproval]
  );


  return (
    <ResizablePanelGroup className="h-full w-full">
      <ResizablePanel defaultSize={isPanelOpen ? 25 : 100} minSize={isPanelOpen ? 400 : 100} className="transition-all duration-300 flex flex-col h-full shrink-0 relative overflow-hidden">
        <div
          className={cn(
            "ease-in-out bg-background flex flex-col h-full shrink-0 relative overflow-hidden w-full"
          )}
        >
          {/* Content Area */}
          <div className="flex-1  flex flex-col min-h-0 overflow-hidden relative">
            <div
              className="absolute opacity-5 inset-0 z-0"
              style={{
                backgroundImage: `
        linear-gradient(45deg, transparent 49%, var(--color-primary) 49%, var(--color-primary) 51%, transparent 51%),
        linear-gradient(-45deg, transparent 49%, var(--color-primary) 49%, var(--color-primary) 51%, transparent 51%)
      `,
                backgroundSize: "40px 40px",
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
                maskImage:
                  "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
              }}
            />
            <div
              className="absolute opacity-15 inset-0 z-0"
              style={{
                background: "radial-gradient(125% 125% at 50% 90%, transparent 40%, var(--color-primary) 100%)",
              }}
            />

            {/*  Diagonal Cross Grid Top Background */}

            {/* Your Content/Components */}
            <Conversation className="flex-1  bg-transparent!">
              <ConversationContent className="p-5 max-w-4xl mx-auto space-y-6 conversation-content">

                {messages.length === 0 && (
                  <EmptyChatState onSuggestionClick={(s) => setInput(s)} />
                )}
                {messages.map((message: any, index: number) => (
                  <MessageBranch defaultBranch={0} key={message.id}>
                    <MessageBranchContent>
                      <Message from={message.role as any} key={message.id}>
                        <div className="max-w-full space-y-4">
                          {message.parts && message.parts.length > 0 &&
                            message.parts.map((part: any, partIdx: number) => {
                              if (part.type === 'text') {
                                return (
                                  <MessageContent key={partIdx} className="text-sm leading-relaxed text-foreground">
                                    <MessageResponse className="bg-transparent border-0 p-0 text-sm leading-relaxed!">
                                      {part.text}
                                    </MessageResponse>
                                  </MessageContent>
                                );
                              }

                              // Generic tool handler that works with both custom and AI SDK standard part types
                              const toolName = part.toolName ||
                                part.toolInvocation?.toolName ||
                                (part.type?.startsWith('tool-') ? part.type.replace('tool-', '') : null);

                              if (toolName) {

                                // 1. STEP 1: Proposal Approval
                                if (toolName === "request_architecture_approval") {
                                  const state = part.state;

                                  if (state === 'approval-requested' || state === 'output-denied' || state === 'output-available' || state === 'result') {
                                    const isPending = state === 'approval-requested';
                                    const isApproved = (state === 'output-available' || state === 'result') && part.approval?.approved === true;
                                    const isDenied = state === 'output-denied' || ((state === 'output-available' || state === 'result') && part.approval?.approved === false);

                                    return (
                                      <div key={partIdx} className="w-full mt-4 border rounded-xl bg-card shadow-sm space-y-2 overflow-hidden">
                                        <div className="flex p-5 items-center gap-3 text-primary pb-2">
                                          <div className="p-2 bg-primary/10 rounded-lg">
                                            <ShieldCheck className="h-5 w-5" />
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-semibold font-serif leading-tight">Architecture Proposal Ready</h4>
                                            <p className="text-[11px] text-muted-foreground">Confirm to proceed with generating the detailed diagram for "{part.input?.title || "Architecture"}".</p>
                                          </div>
                                        </div>
                                        {part.input?.summary && (
                                          <div className="px-5 pb-4 text-xs text-muted-foreground leading-relaxed">
                                            {part.input.summary}
                                          </div>
                                        )}
                                        <div className="flex gap-2 bg-muted/30 border-t p-3 justify-end items-center">
                                          {(isPending || isApproved) && (
                                            <Button
                                              disabled={!isPending}
                                              size="sm"
                                              onClick={() => addToolApprovalResponse({ id: part.approval.id, approved: true })}
                                              className={cn("gap-1.5", isApproved && "bg-primary/20 text-primary hover:bg-primary/20 cursor-default opacity-100")}
                                            >
                                              <Check className="h-4 w-4" />
                                              {isPending ? 'Approve & Generate' : 'Approved'}
                                            </Button>
                                          )}
                                          {(isPending || isDenied) && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              disabled={!isPending}
                                              onClick={() => addToolApprovalResponse({ id: part.approval.id, approved: false })}
                                              className={cn("gap-1.5", isDenied && "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10 cursor-default opacity-100")}
                                            >
                                              <X className="h-4 w-4" />
                                              {isPending ? 'Deny' : 'Denied'}
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }
                                }

                                // 2. STEP 2: Actual Generation Rendering
                                if (toolName === "generate_architecture") {
                                  const state = part.state;
                                  const isReady = state === 'output-available' || state === 'result' || part.result;
                                  const resultRaw = isReady
                                    ? part.output || part.result || part.toolInvocation?.result
                                    : part.input || part.args || part.toolInvocation?.args;

                                  const parsed = parseArchitectureData(resultRaw);
                                  const title = parsed?.title || "Architecture";
                                  const isLatest = index === messages.length - 1;
                                  const isInterrupted = !isReady && (chatStatus === 'ready' || !isLatest);

                                  return (
                                    <div key={partIdx} className="w-full relative mt-4">
                                      {!isReady ? (
                                        <div className={cn(
                                          "w-full border rounded-xl bg-card shadow-sm space-y-2 flex items-center justify-between overflow-hidden gap-3 p-3 pr-10",
                                          !isInterrupted && "animate-pulse"
                                        )}>
                                          <div className={cn("flex items-center gap-3", isInterrupted ? "text-muted-foreground" : "text-primary")}>
                                            <div className={cn("p-2 rounded-lg", isInterrupted ? "bg-muted" : "bg-primary/10")}>
                                              {isInterrupted ? <X className="h-5 w-5" /> : <RiSparklingFill className="h-5 w-5" />}
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-semibold font-serif leading-tight">
                                                {isInterrupted ? "Generation Interrupted" : "Generating Architecture..."}
                                              </h4>
                                              <p className="text-[11px] text-muted-foreground">
                                                {isInterrupted
                                                  ? "This process was stopped. You can try asking for it again."
                                                  : `Architecting "${title}" based on your requirements.`}
                                              </p>
                                            </div>
                                          </div>
                                          {!isInterrupted && <RiLoader2Line className="size-6 animate-spin text-primary" />}
                                        </div>
                                      ) : (
                                        <div className="w-full border rounded-xl bg-card shadow-sm space-y-2 overflow-hidden">
                                          <div className="flex p-5 items-center gap-3 text-primary pb-2">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                              <PiCubeTransparentFill className="h-5 w-5" />
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-semibold font-serif leading-tight">Architecture Generated</h4>
                                              <p className="text-[11px] text-muted-foreground">The architectural model for "{title}" is ready.</p>
                                            </div>
                                          </div>

                                          <div className="flex gap-2 bg-muted/30 border-t p-3 justify-end items-center">
                                            <Button
                                              size="sm"
                                              onClick={() => {
                                                const id = part.toolCallId || `${message.id}-${partIdx}`;
                                                setActiveArchId(id);
                                              }}
                                              className="gap-1.5"
                                            >
                                              <PanelRightOpen className="h-4 w-4" />
                                              View Diagram
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              }
                              return null;
                            })
                          }
                        </div>
                      </Message>
                    </MessageBranchContent>
                  </MessageBranch>
                ))}
                {(chatStatus === ("submitted")) && (
                  <Message from="assistant">
                    <div className="flex items-center gap-2 text-muted-foreground p-2 px-1">
                      <RiSparklingFill className="size-5 animate-pulse text-primary/60" />
                      <Shimmer className="text-md font-medium">
                        Architecting your response...

                      </Shimmer>
                    </div>
                  </Message>
                )}
              </ConversationContent>
              <ConversationScrollButton className="right-4 bottom-4 bg-primary text-primary-foreground" />
            </Conversation>
          </div>

          <div className="w-full max-w-4xl mx-auto p-5">
            <PromptInput globalDrop multiple onSubmit={handleSubmit}>
              <PromptInputBody className="flex items-center justify-between border border-muted rounded-3xl w-full">
                <PromptInputTextarea
                  className="min-h-14 text-xl p-8 font-sans "
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  disabled={isWaitingForApproval}
                  placeholder={isWaitingForApproval ? "Please approve or deny the proposal above..." : "Describe your architecture requirements here..."}
                />
                <PromptInputSubmit
                  className="absolute bottom-3 right-3 size-12 rounded-2xl "
                  disabled={isSubmitDisabled}
                  status={chatStatus}
                />
              </PromptInputBody>
            </PromptInput>
          </div>
        </div>
      </ResizablePanel>
      {isPanelOpen && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75} minSize={200} className="relative bg-muted/5 border-l">
            <ArchitectureCanvasWithEditor
              architectures={allArchitectures}
              selectedIndex={selectedArchIndex}
              onSelectIndex={(index) => setActiveArchId(allArchitectures[index]?.id || null)}
              onClose={() => setActiveArchId(null)}
              isStreaming={chatStatus === 'streaming' || chatStatus === 'submitted'}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

