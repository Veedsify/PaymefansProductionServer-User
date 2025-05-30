import type { Metadata } from "next";
import { Epilogue, Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "../../globals.css";
import { Toaster as SonnerToast } from "sonner";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Paymefans React Application",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 10000,
            style: {
              fontSize: "16px",
              borderRadius: "10px",
              fontFamily: "system-ui",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
