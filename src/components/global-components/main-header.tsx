"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useApp } from "@/providers/app-provider";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { Button } from "../ui/button";
import { FaGithub } from "react-icons/fa6";
import Link from "next/link";

export function MainHeader() {
  const { projectTitle } = useApp();
  const params = useParams();
  const chatId = (params.id as string[] | undefined)?.[0];

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background backdrop-blur-sm z-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        {chatId && (
          <div className="flex items-center gap-2">
            <Separator orientation="vertical" className="h-4" />
            {!projectTitle ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
                {projectTitle}
              </span>
            )}
          </div>
        )}
      </div>
      <Link target="_blank" href="https://github.com/nexr-cloud/open-modeler">

        <Button size={"icon-lg"} variant={"outline"}>
          <FaGithub className="size-5" />
        </Button>
      </Link>
    </header>
  );
}
