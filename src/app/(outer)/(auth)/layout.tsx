import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "../../globals.css";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/common/global/Footer";

export const metadata: Metadata = {
  title: "Paymefans - Login or Sign Up",
  description: "Paymefans - all-in-one platform for creators and fans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
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
        <Footer />
      </body>
    </html>
  );
}
