import { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
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
