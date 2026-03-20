"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/stores/settings.store";
import { useUIStore } from "@/stores/ui.store";
import { toast } from "sonner";
import {
    Settings2, Key, User, Shield,
    Bell, UserCircle, FileText, AlertTriangle, ExternalLink
} from "lucide-react";
import { BsAnthropic, BsGoogle, BsOpenai } from "react-icons/bs";
import { cn } from "@/lib/utils";
import Image from "next/image";

const PROVIDERS = [
    { value: "anthropic", label: "Anthropic", icon: <BsAnthropic /> },
    { value: "google", label: "Google Gemini", icon: <BsGoogle /> },
    { value: "openai", label: "OpenAI", icon: <BsOpenai /> },
];

const MODELS: Record<string, { value: string; label: string }[]> = {
    anthropic: [
        { value: "claude-opus-4-6", label: "Claude 4.6 Opus" },
        { value: "claude-opus-4-5-20251101", label: "Claude 4.5 Opus" },
        { value: "claude-haiku-4-5-20251001", label: "Claude 4.5 Haiku" },
        { value: "claude-sonnet-4-6-20251101", label: "Claude 4.6 Sonnet" },
        { value: "claude-sonnet-4-5-20251101", label: "Claude 4.5 Sonnet" },
        { value: "claude-sonnet-4-2-20250514", label: "Claude 4.2 Sonnet" },
        { value: "claude-opus-4-1-20250805", label: "Claude 4.1 Opus" },
    ],
    google: [
        { value: "gemini-2.5-computer-use-preview-10-2025", label: "Gemini 2.5 Computer Use" },
        { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
        { value: "gemini-2.5-flash-lite-preview-09-2025", label: "Gemini 2.5 Flash Lite" },
        { value: "gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
        { value: "gemini-2.0-flash-lite-001", label: "Gemini 2.0 Flash Lite" },
    ],
    openai: [
        { value: "gpt-4.1-2025-04-14", label: "GPT 4.1" },
        { value: "gpt-4.1-mini-2025-04-14", label: "GPT 4.1 Mini" },
        { value: "gpt-4.1-nano-2025-04-14", label: "GPT 4.1 Nano" },
        { value: "gpt-4o", label: "GPT 4o" },
        { value: "gpt-3.5-turbo-0125", label: "GPT 3.5 Turbo" },
    ]
};

const TABS = [
    { id: 'general', label: 'General', icon: User },
    { id: 'account', label: 'Account', icon: UserCircle },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'license', label: 'License', icon: FileText },

];

export function SettingsDialog() {
    const {
        isSettingsDialogOpen: open, setIsSettingsDialogOpen: onOpenChange,
        settingsActiveTab: activeTab, setSettingsActiveTab: setActiveTab
    } = useUIStore();

    const {
        apiKey, setApiKey,
        selectedProvider, setProvider,
        selectedModel, setModel,
        fullName, setFullName,
        workFunction, setWorkFunction,
        personalPreferences, setPersonalPreferences,
        profilePicUrl, setProfilePicUrl,
        architectureAlertsEnabled, setArchitectureAlertsEnabled,
    } = useSettingsStore();

    // Local buffered state
    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [localProvider, setLocalProvider] = useState(selectedProvider);
    const [localModel, setLocalModel] = useState(selectedModel);
    const [localFullName, setLocalFullName] = useState(fullName);
    const [localProfilePicUrl, setLocalProfilePicUrl] = useState(profilePicUrl);
    const [localWorkFunction, setLocalWorkFunction] = useState(workFunction);
    const [localPersonalPreferences, setLocalPersonalPreferences] = useState(personalPreferences);
    const [localAlertsEnabled, setLocalAlertsEnabled] = useState(architectureAlertsEnabled);

    // Sync local state when dialog opens
    useEffect(() => {
        if (open) {
            setLocalApiKey(apiKey);
            setLocalProvider(selectedProvider);
            setLocalModel(selectedModel);
            setLocalFullName(fullName);
            setLocalProfilePicUrl(profilePicUrl);
            setLocalWorkFunction(workFunction);
            setLocalPersonalPreferences(personalPreferences);
            setLocalAlertsEnabled(architectureAlertsEnabled);
        }
    }, [open, apiKey, selectedProvider, selectedModel, fullName, profilePicUrl, workFunction, personalPreferences, architectureAlertsEnabled]);

    useEffect(() => {
        const setCookie = (name: string, value: string) => {
            document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=2592000; samesite=lax`;
        };
        if (apiKey) setCookie("nexr-api-key", apiKey);
        if (selectedProvider) setCookie("nexr-provider", selectedProvider);
        if (selectedModel) setCookie("nexr-model", selectedModel);
    }, [apiKey, selectedProvider, selectedModel]);

    const handleDone = () => {
        setApiKey(localApiKey);
        setProvider(localProvider);
        setModel(localModel);
        setFullName(localFullName);
        setProfilePicUrl(localProfilePicUrl);
        setWorkFunction(localWorkFunction);
        setPersonalPreferences(localPersonalPreferences);
        setArchitectureAlertsEnabled(localAlertsEnabled);

        onOpenChange(false);
        toast.success("Settings updated");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl h-[620px] gap-0 p-0 overflow-hidden bg-background flex ">
                {/* Sidebar */}
                <div className="w-full sm:w-64 bg-sidebar border-r border-border/40 p-4 space-y-6 shrink-0 flex flex-col">
                    <div className="px-2 py-2 flex items-center gap-2">
                        <div className="p-1 bg-primary/10 rounded-lg">
                            <Settings2 className="size-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-serif font-bold text-foreground">Settings</h2>
                    </div>
                    <nav className="space-y-1 flex flex-col *:justify-start">
                        {TABS.map((tab) => (
                            <Button
                                size={"lg"}
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                variant={activeTab === tab.id ? "default" : "ghost"}

                            >
                                <tab.icon className="size-4 shrink-0 transition-colors" />
                                {tab.label}
                            </Button>
                        ))}
                    </nav>
                    <div className="flex-1 flex items-end">
                        <div className="mt-auto p-4 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20" >
                            <Image src="/logo.png" alt="NEXr Cloud" className="mb-2 " width={80} height={80} />

                            <div className="flex items-center gap-2 mb-2 text-primary">
                                <span className="text-xs font-serif font-semibold tracking-widest">Scale Your Enterprise with NEXr Cloud</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                Deploy intelligent agents that automate complex business operations across SAP, Oracle, and beyond — in weeks, not years.
                            </p>
                            <Button size={"sm"} className="w-full" onClick={() => window.open('https://nexr.cloud/', '_blank')}>
                                Visit NEXr Cloud <ExternalLink className="size-3" /></Button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-foreground mb-1">General Settings</h3>
                                    <p className="text-sm text-muted-foreground">Manage your identity and generation preferences.</p>
                                </div>

                                <div className="grid gap-6">
                                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                                        <div className="space-y-2 flex-1 w-full">

                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-14 border-2 border-primary/20 mt-3">
                                                    <AvatarImage src={localProfilePicUrl} className="rounded-full object-cover" />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                        {localFullName?.charAt(0) || <User className="size-5" />}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 w-full">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                                                    <Input
                                                        className="border-border bg-muted/30"
                                                        value={localFullName}
                                                        onChange={(e) => setLocalFullName(e.target.value)}
                                                        placeholder="Dev"

                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full mt-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Profile Picture URL</label>
                                            <Input
                                                className="border-border bg-muted/30"

                                                value={localProfilePicUrl}
                                                onChange={(e) => setLocalProfilePicUrl(e.target.value)}
                                                placeholder="https://..."

                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Work Description</label>
                                        <Select value={localWorkFunction} onValueChange={setLocalWorkFunction}>
                                            <SelectTrigger className="border-border bg-muted/30">
                                                <SelectValue placeholder="What best describes your role?" />
                                            </SelectTrigger>
                                            <SelectContent rounded-xl>
                                                <SelectItem value="developer">Professional Developer</SelectItem>
                                                <SelectItem value="architect">Enterprise Architect</SelectItem>
                                                <SelectItem value="manager">IT Lead / Product Manager</SelectItem>
                                                <SelectItem value="student">Student / Educator</SelectItem>
                                                <SelectItem value="other">Other Professional</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Personalized Generation Preferences</label>
                                        <Textarea
                                            value={localPersonalPreferences}
                                            onChange={(e) => setLocalPersonalPreferences(e.target.value)}
                                            placeholder="e.g. Focus on microservices and Java-based SAP BTP extensions..."
                                            className="min-h-[140px] bg-muted/30 border-border max-h-[140px]"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t ">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Bell className="size-5 text-primary" />
                                        <h3 className="text-lg font-semibold text-foreground">Alerts & Status</h3>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-primary/10 bg-primary/5">
                                        <div className="space-y-1">
                                            <div className="text-sm font-semibold text-foreground">Architecture Completion Alerts</div>
                                            <div className="text-xs text-muted-foreground">Notify me when the AI-generated architecture is ready to review</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "size-2 rounded-full",
                                                    localAlertsEnabled ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase",
                                                    localAlertsEnabled ? "text-primary" : "text-muted-foreground"
                                                )}>
                                                    {localAlertsEnabled ? "Active" : "Disabled"}
                                                </span>
                                            </div>
                                            <Switch
                                                checked={localAlertsEnabled}
                                                onCheckedChange={setLocalAlertsEnabled}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-foreground mb-1">Model Infrastructure</h3>
                                    <p className="text-sm text-muted-foreground">Secure your API credentials and select preferred LLMs.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Selected Provider</label>
                                            <Select value={localProvider} onValueChange={(val: any) => {
                                                setLocalProvider(val);
                                                setLocalModel(MODELS[val][0].value);
                                            }}>
                                                <SelectTrigger className="border-border w-full bg-muted/30">
                                                    <SelectValue placeholder="Select provider" />
                                                </SelectTrigger>
                                                <SelectContent rounded-xl>
                                                    {PROVIDERS.map(p => (
                                                        <SelectItem key={p.value} value={p.value}>
                                                            <div className="flex items-center gap-2">
                                                                <span className="size-5 rounded bg-muted flex items-center justify-center font-mono text-[10px]">{p.icon}</span>
                                                                {p.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Generation Model</label>
                                            <Select value={localModel} onValueChange={setLocalModel}>
                                                <SelectTrigger className="border-border w-full bg-muted/30">
                                                    <SelectValue placeholder="Select model" />
                                                </SelectTrigger>
                                                <SelectContent rounded-xl>
                                                    {MODELS[localProvider].map(m => (
                                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">API Security Key</label>
                                        </div>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/30" />
                                            <Input
                                                type="password"
                                                placeholder="sk-..."
                                                className="pl-10 border-border bg-muted/30"
                                                value={localApiKey}
                                                onChange={(e) => setLocalApiKey(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 px-1">
                                            <Shield className="size-3 text-positive" />
                                            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                                Your key is encrypted and stored only in your browser's local storage.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-foreground mb-1">Privacy & Data Governance</h3>
                                    <p className="text-sm text-muted-foreground">Our commitment to open-source transparency.</p>
                                </div>

                                <div className="grid gap-4">
                                    <div className="p-6 rounded-xl bg-muted/10 border border-border/40 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Shield className="size-5 text-primary" />
                                            </div>
                                            <h4 className="font-bold text-foreground">Cloud Privacy Assurance</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Open NEXr Modeler follows a strict <strong>Zero-Persistence Policy</strong>. We do not store your chat history, API keys, or architectural designs on any centralized servers. Everything remains within your local browser ecosystem.
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                                <AlertTriangle className="size-5 text-orange-500" />
                                            </div>
                                            <h4 className="font-bold text-foreground font-serif">Usage & Misuse Policy</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            This is an open-source project by the <strong>Open NEXr Project</strong> intended for educational and innovation purposes. Reselling this technology, misrepresenting attribution, or using it for malicious architectural spoofing is strictly prohibited.
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
                                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                                            "Our mission is to democratize enterprise architecture through AI-driven education." — Open NEXr Team
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'license' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-foreground mb-1">Open Source License</h3>
                                    <p className="text-sm text-muted-foreground">Attribution and redistribution guidelines.</p>
                                </div>

                                <div className="p-8 rounded-xl bg-muted/20 border border-border/40 font-mono text-[11px] leading-relaxed custom-scrollbar overflow-y-auto max-h-[300px]">
                                    <p className="mb-4 font-bold text-foreground">Apache License 2.0</p>
                                    <p className="mb-4">Copyright (c) 2026 Open NEXr Project</p>
                                    <p className="mb-4">
                                        Licensed under the Apache License, Version 2.0 (the "License");
                                        you may not use this file except in compliance with the License.
                                        You may obtain a copy of the License at
                                    </p>
                                    <p className="mb-4 text-primary underline">http://www.apache.org/licenses/LICENSE-2.0</p>
                                    <p className="mb-4">
                                        Unless required by applicable law or agreed to in writing, software
                                        distributed under the License is distributed on an "AS IS" BASIS,
                                        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                    </p>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border/40">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-foreground/10 rounded-lg">
                                            <ExternalLink className="size-4" />
                                        </div>
                                        <div className="text-sm font-medium">View Repository</div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => window.open('https://github.com/nexr-cloud/open-modeler', '_blank')}>GitHub</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 px-8 border-t border-border flex items-center justify-end gap-3 bg-muted/5 shrink-0">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            size="lg"
                        >
                            Close
                        </Button>
                        <Button
                            onClick={handleDone}
                            size="lg"
                            className="w-26"
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
