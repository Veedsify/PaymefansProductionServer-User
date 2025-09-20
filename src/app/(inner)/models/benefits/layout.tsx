import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a model",
  description: "Profile page",
};

const BenefitsLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default BenefitsLayout;
