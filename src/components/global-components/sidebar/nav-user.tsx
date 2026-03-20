"use client";

import {
    ChevronDown,
    LogOut,
    Settings,
    UserCircle,
    Sun,
    Moon,
    Laptop
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { SettingsDialog } from "@/components/global-components/settings-dialog";
import { LogoutDialog } from "@/components/global-components/logout-dialog";
import { useSettingsStore } from "@/stores/settings.store";
import { useUIStore } from "@/stores/ui.store";
import { toast } from "sonner";

export function NavUser() {
    const { theme, setTheme } = useTheme();
    const {
        fullName,
        profilePicUrl,
    } = useSettingsStore();
    const { setIsSettingsDialogOpen: setIsDialogOpen, setIsLogoutDialogOpen } = useUIStore();

    // Local session state for early-stage development
    const session = {
        name: fullName || "Architect",
        email: "user@opennexr.dev"
    };

    return (
        <SidebarFooter className="border-t px-2 py-1 flex flex-col gap-4">
            <SidebarMenu className="my-auto">
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton size="lg" className="bg-transparent! ring-0! p-0!">
                                <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 border border-primary/20 shrink-0 overflow-hidden">
                                    {profilePicUrl ? (
                                        <img src={profilePicUrl} alt={session.name} className="size-full object-cover" />
                                    ) : (
                                        <UserCircle className="size-5 text-primary" />
                                    )}
                                </div>

                                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                                    <span className="truncate font-medium font-serif uppercase tracking-widest text-xs">
                                        {session.name}
                                    </span>
                                </div>
                                <ChevronDown className="ml-auto size-4 opacity-50" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 bg-background border-border/50 backdrop-blur-xl" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal p-4">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-serif font-semibold leading-none">{session.name}</p>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="bg-border/50" />
                            <DropdownMenuGroup className="p-1">
                                <DropdownMenuItem onClick={() => setIsDialogOpen(true)} className="cursor-pointer gap-2  focus:bg-accent">
                                    <Settings className="size-4 opacity-60" />
                                    <span>Settings</span>
                                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuGroup className="p-1">
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="cursor-pointer gap-2  focus:bg-accent" onClick={(e) => { e.stopPropagation(); }}>
                                        <div className="flex items-center gap-2">
                                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                            <span>Theme</span>
                                        </div>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="w-40 bg-background border-border/50">
                                            <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer gap-2 py-2">
                                                <Sun className="h-4 w-4" />
                                                <span>Light</span>
                                                {theme === "light" && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer gap-2 py-2">
                                                <Moon className="h-4 w-4" />
                                                <span>Dark</span>
                                                {theme === "dark" && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer gap-2 py-2">
                                                <Laptop className="h-4 w-4" />
                                                <span>System</span>
                                                {theme === "system" && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                                            </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>

                                <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)} className="cursor-pointer gap-2 py-2  focus:bg-accent *:text-destructive! focus:text-destructive">
                                    <LogOut className="size-4 opacity-60 *:text-destructive!" />
                                    <span>Log out</span>
                                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <SettingsDialog />
            <LogoutDialog />
        </SidebarFooter>
    );
}
