import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Point User",
  description: "Support users withs points",
};

function Layout({ children }: { children: ReactNode }) {
  return <> {children}</>;
}

export default Layout;
