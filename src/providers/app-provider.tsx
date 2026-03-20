"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { truncateProjectTitle } from "@/lib/utils";

interface AppContextType {
    projectId: string | null;
    projectTitle: string | null;
    setProjectTitle: (title: string | null) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const params = useParams();

    const projectId = (params.id || params.projectId) as string || null;
    const [projectTitle, _setProjectTitle] = React.useState<string | null>(null);

    const setProjectTitle = React.useCallback((title: string | null) => {
        _setProjectTitle(truncateProjectTitle(title));
    }, []);

    const value = React.useMemo(() => ({
        projectId,
        projectTitle,
        setProjectTitle
    }), [projectId, projectTitle, setProjectTitle]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = React.useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
