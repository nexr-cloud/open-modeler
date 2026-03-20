"use client";

import Link from "next/link";
import { ChevronDown, LayoutGrid, Plus, Atom } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiCubeTransparentFill } from "react-icons/pi";
import {
    SidebarMenuButton,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface NavHeaderProps {
}

export function NavHeader({ }: NavHeaderProps) {
    const router = useRouter();
    const handleNewProject = () => {
        router.push("/chat");
    };

    return (
        <SidebarHeader className="flex items-center p-0!">
            <SidebarMenu className=" my-auto border-b px-2 h-14 flex items-center justify-center w-full ">
                <SidebarMenuItem className="w-full">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton size="lg" className="bg-transparent! ring-0! p-0!">
                                <div className="flex items-center shrink-0 justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                    <PiCubeTransparentFill className="size-8 p-0.5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                                    <span className="truncate font-bold tracking-widest flex flex-col">
                                        <span className="text-primary text-sm">Open NEXr</span>
                                        <span className="text-xs opacity-70">MODELER</span>
                                    </span>
                                </div>
                                <ChevronDown className="ml-auto size-4 opacity-50" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) rounded-lg" align="start" side="bottom" sideOffset={4}>
                            <DropdownMenuItem asChild>
                                <Link href="/chat" className="flex text-nowrap items-center gap-2">
                                    <Plus className="size-4" /> New Project
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <div className="w-full px-2">
                <SidebarMenuButton
                    onClick={handleNewProject}
                    className="px-3 text-primary! bg-linear-to-r from-primary/20 to-primary/10 my-2 h-10 hover:bg-primary/20 transition-colors"
                >
                    <Plus className="size-5" />
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="truncate text-xs font-bold uppercase tracking-wider leading-tight">
                            New Project
                        </span>
                    </div>
                </SidebarMenuButton>
            </div>
        </SidebarHeader >
    );
}
