import "@fontsource-variable/bricolage-grotesque";
import QueryProvider from "@/providers/QueryProvider";
import "../globals.css";
const OuterLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <div className="">
          <QueryProvider>{children}</QueryProvider>
        </div>
      </body>
    </html>
  );
};
export default OuterLayout;
