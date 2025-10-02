"use client";
import type { ReactNode } from "react";
import "@fontsource-variable/bricolage-grotesque";
export default function OuterPagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
