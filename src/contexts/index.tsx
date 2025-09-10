'use client'

import React, { ReactNode } from "react";
import { TansackQueryProvider } from "./tansack-query";
import { AuthProvider } from "./authentication";

interface AllProvidersProps {
  children: ReactNode;
}

export const AllProviders: React.FC<AllProvidersProps> = ({ children }) => (
  <TansackQueryProvider>
    <AuthProvider>
      <>{children}</>
    </AuthProvider>
  </TansackQueryProvider>
);
