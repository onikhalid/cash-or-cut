import React, { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const TansackQueryContext = createContext<QueryClient | undefined>(undefined);

export const useTansackQueryClient = () => {
    const context = useContext(TansackQueryContext);
    if (!context) {
        throw new Error('useTansackQueryClient must be used within a TansackQueryProvider');
    }
    return context;
};

const queryClient = new QueryClient();

export const TansackQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TansackQueryContext.Provider value={queryClient}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </TansackQueryContext.Provider>
);