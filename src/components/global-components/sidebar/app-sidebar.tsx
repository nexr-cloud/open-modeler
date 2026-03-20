"use client";

import * as React from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarRail,
} from "@/components/ui/sidebar";

import { useApp } from "@/providers/app-provider";
import { NavHeader } from "./nav-header";
import { NavHistory } from "./nav-history";
import { NavUser } from "./nav-user";

export function AppSidebar() {
    const { projectId } = useApp();

    return (
        <Sidebar collapsible="icon" className="border-r border-border/50 backdrop-blur-xl">
            <NavHeader />

            <SidebarContent className="py-4 pt-0 overflow-x-hidden mask-[linear-gradient(to_bottom,transparent_0,white_30px,white_calc(100%-30px),transparent_100%)]">
                <NavHistory />
            </SidebarContent>

            <NavUser />
            {/* <SidebarRail /> */}
        </Sidebar>
    );
}
