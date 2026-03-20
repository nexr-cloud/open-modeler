"use client";

import * as React from "react";
import { Plus, MessageSquare, MoreHorizontal, Trash2, Edit2, MoreVertical, Pin, PinOff } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuAction,
} from "@/components/ui/sidebar";
import { BiMessageSquareDetail } from "react-icons/bi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects, useCreateProject, useDeleteProject, useUpdateProject, type Project } from "@/queries/project.query";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/providers/app-provider";
import { toast } from "sonner";

interface ProjectItemProps {
    project: Project;
    currentId: string | undefined;
    setProjectTitle: (title: string | null) => void;
    setEditingProject: (project: Project) => void;
    setNewTitle: (title: string) => void;
    setDeletingProject: (project: Project) => void;
    togglePin: (project: Project) => void;
}

function ProjectItem({
    project,
    currentId,
    setProjectTitle,
    setEditingProject,
    setNewTitle,
    setDeletingProject,
    togglePin
}: ProjectItemProps) {
    const router = useRouter();

    return (
        <SidebarMenuItem key={project.id} className="group/item">
            <SidebarMenuButton
                onClick={() => {
                    setProjectTitle(project.title);
                    router.push(`/chat/${project.id}`);
                }}
                className={cn(
                    "py-5 px-3 hover:bg-primary/5 transition-all duration-200 border-transparent h-12",
                    currentId === project.id && "bg-linear-to-r from-primary/10 to-primary/5 text-primary border-primary!"
                )}
            >
                <BiMessageSquareDetail className={cn(
                    "size-4 text-muted-foreground group-hover/item:text-primary transition-colors shrink-0",
                    currentId === project.id && "text-primary placeholder:text-primary"
                )} />
                <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className={cn(
                        "truncate text-[11px] font-medium leading-tight pr-4",
                        currentId === project.id && "text-primary font-bold"
                    )}>
                        {project.title}
                    </span>
                    <span className="text-[9px] text-muted-foreground opacity-60">
                        {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                    </span>
                </div>
            </SidebarMenuButton>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuAction className="opacity-0 h-6 w-6 group-hover/item:opacity-100 mt-2  data-[state=open]:opacity-100 transition-opacity">
                        <MoreVertical className="size-7" />
                    </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 border-border/50 backdrop-blur-xl">
                    <DropdownMenuItem
                        className="gap-2 text-[11px]"
                        onClick={() => togglePin(project)}
                    >
                        {project.isPinned ? (
                            <><PinOff className="size-3" /> Unpin</>
                        ) : (
                            <><Pin className="size-3" /> Pin Project</>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="gap-2 text-[11px]"
                        onClick={() => {
                            setEditingProject(project);
                            setNewTitle(project.title);
                        }}
                    >
                        <Edit2 className="size-3" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setDeletingProject(project)}
                        className="gap-2 text-[11px] text-destructive focus:text-destructive"
                    >
                        <Trash2 className="size-3 *:text-destructive!" /> Delete Project
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}

export function NavHistory() {
    const { data: projects, isLoading } = useProjects();
    const { mutate: deleteProject } = useDeleteProject();
    const { mutate: updateProject } = useUpdateProject();
    const { setProjectTitle } = useApp();
    const router = useRouter();
    const params = useParams();
    const currentId = params.id?.[0];

    const [editingProject, setEditingProject] = React.useState<Project | null>(null);
    const [newTitle, setNewTitle] = React.useState("");
    const [deletingProject, setDeletingProject] = React.useState<Project | null>(null);

    // Sync title with context on load or change
    React.useEffect(() => {
        if (projects && currentId) {
            const project = projects.find(p => p.id === currentId);
            if (project) {
                setProjectTitle(project.title);
            }
        }
    }, [projects, currentId, setProjectTitle]);

    const handleRename = () => {
        if (!editingProject || !newTitle.trim()) return;

        updateProject({
            id: editingProject.id,
            updates: { title: newTitle.trim() }
        }, {
            onSuccess: () => {
                if (currentId === editingProject.id) {
                    setProjectTitle(newTitle.trim());
                }
                setEditingProject(null);
                setNewTitle("");
                toast.success("Project renamed successfully");
            }
        });
    };

    const handleDelete = () => {
        if (!deletingProject) return;

        deleteProject(deletingProject.id, {
            onSuccess: () => {
                if (currentId === deletingProject.id) {
                    router.push("/");
                }
                setDeletingProject(null);
                toast.success("Project deleted successfully");
            }
        });
    };

    const togglePin = (project: Project) => {
        updateProject({
            id: project.id,
            updates: { isPinned: !project.isPinned }
        }, {
            onSuccess: () => {
                toast.success(project.isPinned ? "Project unpinned" : "Project pinned");
            }
        });
    };

    const pinnedProjects = projects?.filter(p => p.isPinned) || [];
    const recentProjects = projects?.filter(p => !p.isPinned) || [];


    return (
        <>
            <SidebarGroup>
                {isLoading ? (
                    <SidebarMenu>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <SidebarMenuItem key={i}>
                                <div className="flex items-center gap-3 px-3 py-3">
                                    <Skeleton className="size-4 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-3 w-[80%]" />
                                        <Skeleton className="h-2 w-[40%]" />
                                    </div>
                                </div>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                ) : (
                    <>
                        {pinnedProjects.length > 0 && (
                            <>
                                <SidebarGroupLabel className="text-xs! font-semibold px-3 group-data-[collapsible=icon]:hidden">
                                    Pinned
                                </SidebarGroupLabel>
                                <SidebarMenu>
                                    {pinnedProjects.map((project) => (
                                        <ProjectItem
                                            key={project.id}
                                            project={project}
                                            currentId={currentId}
                                            setProjectTitle={setProjectTitle}
                                            setEditingProject={setEditingProject}
                                            setNewTitle={setNewTitle}
                                            setDeletingProject={setDeletingProject}
                                            togglePin={togglePin}
                                        />
                                    ))}
                                </SidebarMenu>
                            </>
                        )}

                        {projects?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-bottom-2 duration-700">
                                <div className="p-4 rounded-2xl bg-linear-to-br from-primary/20 to-transparent border border-primary/20 shadow-sm relative overflow-hidden group/empty">
                                    <BiMessageSquareDetail className="size-8 text-primary" />
                                </div>
                                <div className="space-y-1.5 translate-y-2">
                                    <p className="text-sm font-bold font-serif uppercase tracking-[0.2em] text-foreground/70">
                                        No Projects
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-[160px] mx-auto font-medium">
                                        Start a new conversation to see your architectural projects here.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <SidebarGroupLabel className="text-xs! font-semibold px-3 group-data-[collapsible=icon]:hidden mt-2">
                                    Recent Projects
                                </SidebarGroupLabel>
                                <SidebarMenu>
                                    {recentProjects.map((project) => (
                                        <ProjectItem
                                            key={project.id}
                                            project={project}
                                            currentId={currentId}
                                            setProjectTitle={setProjectTitle}
                                            setEditingProject={setEditingProject}
                                            setNewTitle={setNewTitle}
                                            setDeletingProject={setDeletingProject}
                                            togglePin={togglePin}
                                        />
                                    ))}
                                </SidebarMenu>
                            </>
                        )}
                    </>
                )}
            </SidebarGroup >

            <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Rename Project</DialogTitle>
                        <DialogDescription>
                            Enter a new name for this conversation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Project title"
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingProject(null)}>Cancel</Button>
                        <Button onClick={handleRename} disabled={!newTitle.trim()}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
                <DialogContent className="sm:max-w-md border-destructive/20">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{deletingProject?.title}"</span>? This action cannot be undone and will delete all associated messages.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="ghost" onClick={() => setDeletingProject(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
