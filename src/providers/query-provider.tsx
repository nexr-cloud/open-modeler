"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000, // 5 minutes
                        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
                        refetchOnWindowFocus: false,
                        refetchOnMount: false, // Don't refetch on component mount if data is fresh
                        refetchOnReconnect: false, // Don't auto-refetch on reconnect
                        retry: 1, // Only retry once instead of 3 times
                    },
                    mutations: {
                        retry: 0, // Don't retry mutations
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
                position="bottom-right"
                expand={true}
                duration={4000}
                closeButton
                offset="32px"
                gap={12}
                theme="light"
                toastOptions={{
                    className: "sonnerLB-toast-shell sonnerLB-has-loader",
                }}
            />
            {/* Only show devtools in development */}
            {/* {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />} */}
        </QueryClientProvider>
    );
}
