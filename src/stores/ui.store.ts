import { create } from "zustand";

interface UIState {
    isSettingsDialogOpen: boolean;
    settingsActiveTab: string;
    isLogoutDialogOpen: boolean;
    
    setIsSettingsDialogOpen: (open: boolean) => void;
    setSettingsActiveTab: (tab: string) => void;
    setIsLogoutDialogOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSettingsDialogOpen: false,
    settingsActiveTab: "general",
    isLogoutDialogOpen: false,

    setIsSettingsDialogOpen: (open) => set({ isSettingsDialogOpen: open }),
    setSettingsActiveTab: (tab) => set({ settingsActiveTab: tab }),
    setIsLogoutDialogOpen: (open) => set({ isLogoutDialogOpen: open }),
}));
