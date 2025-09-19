import "../globals.css";
import { Geist } from "next/font/google";
const font = Geist({
  subsets: ["latin", "latin-ext"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const OuterLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
};
export default OuterLayout;
