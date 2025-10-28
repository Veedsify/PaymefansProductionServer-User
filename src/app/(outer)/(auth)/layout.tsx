import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "../../globals.css";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/common/global/Footer";
import { Bricolage_Grotesque } from "next/font/google";

export const metadata: Metadata = {
  title: "Paymefans - Login or Sign Up",
  description: "Paymefans - all-in-one platform for creators and fans.",
};

const font = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-bricolage-grotesque",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className} suppressHydrationWarning>
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
