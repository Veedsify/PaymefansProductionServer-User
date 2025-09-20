import QueryProvider from "@/providers/QueryProvider";
import "../globals.css";
const OuterLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
};
export default OuterLayout;
