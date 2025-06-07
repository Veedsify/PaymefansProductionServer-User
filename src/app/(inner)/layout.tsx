import "../globals.css";
import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import localFont from "next/font/local";
import MenuButtons from "@/components/modals/MenuButtons";
import SideModels from "@/components/models/SideModels";
import Header from "@/components/common/Header";
import SideBar from "@/components/common/SideBar";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToast } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import getUserData from "@/utils/data/UserData";
import PostComponentPreview from "@/components/post/FullComponentPreview";
import { UserContextProvider } from "@/lib/UserUseContext";
import { UserPointsContextProvider } from "@/contexts/PointsContext";
import Loader from "@/components/common/Loader";
import ToggleWishListProvider from "@/contexts/ToggleWishlist";
import WishList from "@/components/sub_components/WishList";
import { GeistSans } from "geist/font/sans";
import { MessagesConversationProvider } from "@/contexts/MessageConversationContext";
import UserAccountSupendedScreen from "@/components/sub_components/UserAccountSuspendedScreen";
import ConfigProvider from "@/contexts/ConfigContext";
import { Inter } from "next/font/google";
import Head from "next/head";

const font = Inter({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paymefans",
  description: "Paymefans - The Ultimate Fan Experience",
  icons: {
    icon: "/site/logo.svg",
    shortcut: "/site/logo.svg",
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
  const user = await getUserData();
  if (user && !user.active_status) {
    return (
      <html>
        <body
          className={`bg-white dark:bg-gray-950 min-h-dvh flex items-center justify-center ${font.className}`}
        >
          <UserAccountSupendedScreen user={user} />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/site/logo.svg" />
        <link rel="apple-touch-icon" href="/site/logo.svg" sizes="180x180" />
        <link rel="manifest" href="/site/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
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
      <body className={`dark:bg-gray-950 min-h-dvh ${font.className}`}>
        <ConfigProvider>
          <UserContextProvider user={user}>
            <QueryProvider>
              <MessagesConversationProvider>
                <UserPointsContextProvider>
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
                  <div className="relative grid h-dvh lg:grid-cols-8">
                    <MessagesConversationProvider>
                      <ToggleWishListProvider>
                        <div className="col-span-2">
                          <SideBar />
                        </div>
                        <div className="relative h-dvh col-span-6 overflow-auto border-r border-pink-50">
                          <Header />
                          <div className="grid lg:grid-cols-6 pt-[66px] lg:pt-[48px] h-dvh">
                            <div className="flex flex-col h-full col-span-3">
                              <div className="w-full h-full md:border-r border-primary-dark-pink/40 dark:border-slate-800">
                                {children}
                              </div>
                            </div>
                            <SideModels />
                          </div>
                        </div>
                        <WishList />
                      </ToggleWishListProvider>
                    </MessagesConversationProvider>
                    <MenuButtons />
                    {/* <ModalComponent /> */}
                  </div>
                  <PostComponentPreview />
                </UserPointsContextProvider>
              </MessagesConversationProvider>
            </QueryProvider>
          </UserContextProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
