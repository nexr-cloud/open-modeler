"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/global-components/sidebar/app-sidebar";
import { AppProvider } from "@/providers/app-provider";
import { MainHeader } from "@/components/global-components/main-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AppProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-hidden bg-background">
          <MainHeader />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AppProvider>
  );
}
