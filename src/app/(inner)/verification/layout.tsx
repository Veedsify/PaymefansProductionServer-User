import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification",
  description: "Verify your identity by taking a short peace sign video",
};
const VerificationLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default VerificationLayout;
