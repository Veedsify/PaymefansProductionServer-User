import "@fontsource-variable/bricolage-grotesque";
import QueryProvider from "@/providers/QueryProvider";
import "../globals.css";
import { Bricolage_Grotesque } from "next/font/google";
import { cn } from "@/components/ui/cn";
const font = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-bricolage-grotesque",
});
const OuterLayout = ({ children }: { children: React.ReactNode }) => {
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
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
      <body className={cn(` dark:bg-black min-h-dvh`, font.className)}>
        <div>
          <QueryProvider>{children}</QueryProvider>
        </div>
      </body>
    </html>
  );
};
export default OuterLayout;
