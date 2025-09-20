import type { ReactNode } from "react";
import "@fontsource-variable/geist";
import "./style.css";

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
