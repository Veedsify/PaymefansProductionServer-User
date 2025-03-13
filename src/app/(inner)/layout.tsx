import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { GeistSans } from "geist/font/sans";

const font = Instrument_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// import { GeistSans } from 'geist/font/sans';
// import { GeistSans } from 'geist/font/sans';
import "../globals.css";
import MenuButtons from "@/components/modals/menu_buttons";
import SideModels from "@/components/models/side_models";
import Header from "@/components/common/header";
import SideBar from "@/components/common/sidebar";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToast } from "sonner";
import QueryProvider from "@/providers/query-provider";
import getUserData from "@/utils/data/user-data";
import PostComponentPreview from "@/components/post/full-component-preview";
import { UserContextProvider } from "@/lib/userUseContext";
import { UserPointsContextProvider } from "@/contexts/user-points-context";
import { MessagesConversationProvider } from "@/contexts/messages-conversation-context";
import Loader from "@/components/common/loader";
import VerificationAlert from "@/components/common/verification-alert";
import ToggleWishListProvider from "@/contexts/toggle-wishlist";
import WishList from "@/components/sub_components/wishlist";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export const revalidate = 300;
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserData();
  return (
    <html lang="en">
      <body
        className={`
                ${font.className}
                 dark:bg-gray-950 min-h-screen`}
      >
        <UserContextProvider user={user}>
          <QueryProvider>
            <MessagesConversationProvider>
              <UserPointsContextProvider>
                <Loader />
                <Toaster />
                <SonnerToast
                  richColors
                  position="top-center"
                  toastOptions={{
                    closeButton: true,
                    duration: 10000,
                    style: {
                      fontSize: "16px",
                      borderRadius: "10px",
                      fontFamily: "system-ui",
                    },
                  }}
                />
                <div className="relative grid lg:grid-cols-9 h-screen">
                  <MessagesConversationProvider>
                    <ToggleWishListProvider>
                      <div className="col-span-2">
                        <SideBar />
                      </div>
                      <div className="col-span-7 overflow-auto border-r h-screen relative">
                        <Header />
                        <div className="grid lg:grid-cols-7 pt-[73px] lg:pt-[54px] h-screen">
                          <div className="col-span-4 flex flex-col h-full">
                            <div className="w-full md:border-r dark:border-slate-800 h-full">
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
      </body>
    </html>
  );
}
