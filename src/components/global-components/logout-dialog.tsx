"use client";

import { useUIStore } from "@/stores/ui.store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogOut, RefreshCcw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export function LogoutDialog() {
    const { isLogoutDialogOpen, setIsLogoutDialogOpen } = useUIStore();

    const handleConfirmLogout = () => {
        // Clear all local application data
        localStorage.removeItem("nexr_projects");
        localStorage.removeItem("nexr_messages");
        localStorage.removeItem("nexr-settings");
        sessionStorage.clear();

        toast.success("Workspace securely reset. Refreshing...");
        setIsLogoutDialogOpen(false);

        // Refresh to home page to clear all store state and cache
        setTimeout(() => {
            window.location.href = "/";
        }, 1000);
    };

    return (
        <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-destructive/20 bg-background">
                <div className="p-6 pt-8 flex flex-col items-center text-center space-y-4 p-3">
                    <div className="size-16 rounded-xl bg-destructive/10 flex items-center justify-center animate-in zoom-in duration-300">
                        <ShieldAlert className="size-8 text-destructive" />
                    </div>

                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-serif font-bold text-foreground">
                            Reset Workspace?
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground leading-relaxed px-2">
                            This action will permanently delete all your projects, chat history, and API settings from your browser.
                            <span className="block mt-2 font-bold text-destructive font-sans uppercase tracking-widest text-[10px]">
                                This cannot be undone.
                            </span>
                        </DialogDescription>
                    </div>
                </div>


                <div className="grid grid-cols-1 p-3 gap-3 mb-6">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 shadow-sm">
                        <p className="text-xs text-muted-foreground leading-snug">
                            <span className="font-bold text-foreground block mb-0.5">Clears Local Storage</span>
                            All architectural designs and message logs will be removed from your browser.
                        </p>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 shadow-sm">
                        <p className="text-xs text-muted-foreground leading-snug">
                            <span className="font-bold text-foreground block mb-0.5">Resets API Keys</span>
                            All provider credentials and personalization settings will be wiped.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 border-t bg-muted/50 p-4 justify-end">
                    <Button
                        variant="ghost"

                        onClick={() => setIsLogoutDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirmLogout}
                    >
                        <AlertTriangle className="size-4" />
                        Reset & Logout
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
