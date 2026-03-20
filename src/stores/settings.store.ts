import { create } from "zustand";
import { persist, StorageValue } from "zustand/middleware";
import { conceal, reveal } from "@/lib/utils";

interface SettingsState {
    apiKey: string;
    selectedProvider: "anthropic" | "google" | "openai";
    selectedModel: string;

    // Profile settings
    fullName: string;
    workFunction: string;
    personalPreferences: string;
    profilePicUrl: string;
    architectureAlertsEnabled: boolean;

    setApiKey: (key: string) => void;
    setProvider: (provider: "anthropic" | "google" | "openai") => void;
    setModel: (model: string) => void;

    // Profile setters
    setFullName: (name: string) => void;
    setWorkFunction: (func: string) => void;
    setPersonalPreferences: (prefs: string) => void;
    setProfilePicUrl: (url: string) => void;
    setArchitectureAlertsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            apiKey: "",
            selectedProvider: "anthropic",
            selectedModel: "claude-opus-4-6",

            fullName: "",
            workFunction: "",
            personalPreferences: "",
            profilePicUrl: "https://img.icons8.com/?size=128&id=txmnrJwlctOz&format=png",
            architectureAlertsEnabled: true,

            setApiKey: (key) => set({ apiKey: key }),
            setProvider: (provider) => set({ selectedProvider: provider }),
            setModel: (model) => set({ selectedModel: model }),

            setFullName: (name) => set({ fullName: name }),
            setWorkFunction: (func) => set({ workFunction: func }),
            setPersonalPreferences: (prefs) => set({ personalPreferences: prefs }),
            setProfilePicUrl: (url) => set({ profilePicUrl: url }),
            setArchitectureAlertsEnabled: (enabled) => set({ architectureAlertsEnabled: enabled }),
        }),
        {
            name: "nexr-settings",
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    try {
                        const { state, version } = JSON.parse(str);
                        return {
                            state: {
                                ...state,
                                apiKey: reveal(state.apiKey)
                            },
                            version
                        } as StorageValue<SettingsState>;
                    } catch (e) {
                        return null;
                    }
                },
                setItem: (name, newValue) => {
                    const { state, version } = newValue;
                    localStorage.setItem(name, JSON.stringify({
                        state: {
                            ...state,
                            apiKey: conceal(state.apiKey)
                        },
                        version
                    }));
                },
                removeItem: (name) => localStorage.removeItem(name),
            }
        }
    )
);
