"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";

// --- Types ---
export interface Project {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    isPinned: boolean;
    metaData?: Record<string, any>;
}

export interface Message {
    id: string;
    projectId: string;
    role: "user" | "assistant" | "system" | "data" | "tool";
    parts: any[];
    createdAt: string;
    metaData?: Record<string, any>;
}

const PROJECTS_KEY = "nexr_projects";
const MESSAGES_KEY = "nexr_messages";

// --- Fake API Service ---
const projectService = {
    // --- Project Operations ---
    getProjects: async (): Promise<Project[]> => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const data = localStorage.getItem(PROJECTS_KEY);
        return data ? JSON.parse(data) : [];
    },

    getProject: async (id: string): Promise<Project | null> => {
        const projects = await projectService.getProjects();
        return projects.find((p) => p.id === id) || null;
    },

    createProject: async (title: string, metaData?: Record<string, any>): Promise<Project> => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const projects = await projectService.getProjects();
        const newProject: Project = {
            id: nanoid(),
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPinned: false,
            metaData,
        };
        const updatedProjects = [newProject, ...projects];
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
        return newProject;
    },

    updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
        const projects = await projectService.getProjects();
        const index = projects.findIndex((p) => p.id === id);
        if (index === -1) throw new Error("Project not found");

        const updatedProject = {
            ...projects[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        projects[index] = updatedProject;
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
        return updatedProject;
    },

    deleteProject: async (id: string): Promise<void> => {
        const projects = await projectService.getProjects();
        const updatedProjects = projects.filter((p) => p.id !== id);
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));

        // Cascade delete messages
        const messages = await projectService.getAllMessages();
        const filteredMessages = messages.filter(m => m.projectId !== id);
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));
    },

    // --- Message Operations ---
    getAllMessages: async (): Promise<Message[]> => {
        const data = localStorage.getItem(MESSAGES_KEY);
        return data ? JSON.parse(data) : [];
    },

    getMessagesByProject: async (projectId: string): Promise<Message[]> => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const messages = await projectService.getAllMessages();
        return messages.filter((m) => m.projectId === projectId);
    },

    createMessage: async (params: {
        id?: string,
        projectId: string,
        role: Message["role"],
        parts: any[],
        metaData?: Record<string, any>
    }): Promise<Message> => {
        const messages = await projectService.getAllMessages();
        const existingIndex = params.id ? messages.findIndex(m => m.id === params.id) : -1;

        if (existingIndex !== -1) {
            // Update existing message
            const updatedMessage = {
                ...messages[existingIndex],
                parts: params.parts,
                metaData: params.metaData,
                // Don't update createdAt to preserve original timestamp
            };
            messages[existingIndex] = updatedMessage;
            localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
            return updatedMessage;
        }

        // Create new message
        const newMessage: Message = {
            id: params.id || nanoid(),
            projectId: params.projectId,
            role: params.role,
            parts: params.parts,
            createdAt: new Date().toISOString(),
            metaData: params.metaData,
        };

        localStorage.setItem(MESSAGES_KEY, JSON.stringify([...messages, newMessage]));

        // Update project's updatedAt
        await projectService.updateProject(params.projectId, { updatedAt: new Date().toISOString() });

        return newMessage;
    },
};

// --- TanStack Hooks ---

// Project Hooks
export const useProjects = () => {
    return useQuery({
        queryKey: ["projects"],
        queryFn: projectService.getProjects,
    });
};

export const useProject = (id: string | null | undefined) => {
    return useQuery({
        queryKey: ["projects", id],
        queryFn: () => (id ? projectService.getProject(id) : null),
        enabled: !!id,
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { title: string; metaData?: Record<string, any> }) =>
            projectService.createProject(vars.title, vars.metaData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { id: string; updates: Partial<Project> }) =>
            projectService.updateProject(vars.id, vars.updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["projects", data.id] });
        },
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: projectService.deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
    });
};

// Message Hooks
export const useMessages = (projectId: string | null | undefined) => {
    return useQuery({
        queryKey: ["messages", projectId],
        queryFn: () => (projectId ? projectService.getMessagesByProject(projectId) : []),
        enabled: !!projectId,
    });
};

export const useCreateMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: projectService.createMessage,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["messages", data.projectId] });
            queryClient.invalidateQueries({ queryKey: ["projects"] }); // To update updatedAt sort
        },
    });
};
