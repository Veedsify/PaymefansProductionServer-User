import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Setings & Privacy | Paymefans",
  description: "Profile page",
};
const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default SettingsLayout;
