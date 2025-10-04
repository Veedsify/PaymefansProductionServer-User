import "@fontsource-variable/bricolage-grotesque";
import "../globals.css";
import type { Metadata } from "next";
import type React from "react";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToast } from "sonner";
import dynamic from "next/dynamic";
import Header from "@/components/common/global/Header";
import Loader from "@/components/common/loaders/Loader";
import LayoutWithWishlist from "@/components/layout/LayoutWithWishlist";
import MenuButtons from "@/components/modals/MenuButtons";
import GuestLoginModal from "@/features/guest/GuestLoginModal";
const SideBar = dynamic(() => import("@/components/common/global/SideBar"), {});
const SideModels = dynamic(() => import("@/features/models/comps/SideModels"));
const PostComponentPreview = dynamic(
  () => import("@/features/post/FullComponentPreview")
);
import CombinedProviders from "@/providers/CombinedProviders";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Paymefans",
  description: "Paymefans - The Ultimate Fan Experience",
  icons: {
    icon: "/icons/favicon.svg",
    shortcut: "/site/favicon.svg",
  },
  authors: [
    {
      name: "Paymefans",
      url: "https://paymefans.com",
    },
  ],
};

export const revalidate = 300;
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/favicon.svg" />
        <link
          rel="apple-touch-icon"
          href="/icons/favicon.svg"
          sizes="180x180"
        />
        <link rel="manifest" href="/webmanifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta
          name="description"
          content="Paymefans - The Ultimate Fan Experience"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta property="og:image" content="/site/logo.svg" />
      </head>
      <body className={` dark:bg-black min-h-dvh`}>
        <QueryProvider>
          <CombinedProviders>
            <Loader />
            <Toaster
              toastOptions={{
                duration: 5000,
                style: {
                  fontSize: "14px",
                  fontWeight: "500",
                  border: "1px solid #CC0DF8",
                  borderRadius: "100vmax",
                },
                className:
                  "dark:bg-gray-900 dark:text-white dark:border-gray-600",
              }}
            />
            <SonnerToast
              richColors
              position="top-center"
              toastOptions={{
                closeButton: true,
                duration: 10000,
                style: {
                  fontSize: "16px",
                  borderRadius: "100vmax",
                },
              }}
            />
            <div className="relative select-none grid h-dvh lg:grid-cols-8 scrollable-content">
              <div className="col-span-2">
                <SideBar />
              </div>
              <div className="relative overflow-auto border-r h-dvh col-span-6 border-gray-300">
                <Header />
                <div className="grid lg:grid-cols-6 pt-[66px] lg:pt-[48px] h-dvh">
                  <div className="flex flex-col h-full col-span-3">
                    <div className="w-full h-full md:border-r border-black/20 dark:border-slate-800 pb-8 lg:pb-0">
                      {children}
                    </div>
                  </div>
                  <LayoutWithWishlist>
                    <SideModels />
                  </LayoutWithWishlist>
                </div>
              </div>
              <MenuButtons />
              {/* <ModalComponent /> */}
            </div>
            <PostComponentPreview />
            <GuestLoginModal />
          </CombinedProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
