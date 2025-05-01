import { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { Inter } from "next/font/google";
import "./style.css";
const font = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  adjustFontFallback: false,
});

export default function OuterPagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
