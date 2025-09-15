"use client";

import { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import ConfigProvider from "@/contexts/ConfigContext";

interface MinimalProvidersProps {
  children: ReactNode;
}

/**
 * Minimal providers for routes that don't need full context (e.g., auth pages, public pages).
 * This provides only essential providers to reduce bundle size and improve performance.
 */
const MinimalProviders = ({ children }: MinimalProvidersProps) => {
  return (
    <ConfigProvider>
      <QueryProvider>{children}</QueryProvider>
    </ConfigProvider>
  );
};

export default MinimalProviders;
