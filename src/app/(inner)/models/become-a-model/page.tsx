import type { Metadata } from "next";
import BecomeAModelContainer from "@/features/models/components/BecomeAModel/BecomeAModelContainer";

export const metadata: Metadata = {
  title: "Become a model",
  description: "Profile page",
};

function BecomeAModelPage() {
  return <BecomeAModelContainer />;
}

export default BecomeAModelPage;
