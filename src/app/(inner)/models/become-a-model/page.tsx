import type { Metadata } from "next";
import BecomeAModel from "@/features/models/comps/BecomeAModel";

export const metadata: Metadata = {
  title: "Become a model",
  description: "Profile page",
};

function BecomeAModelPage() {
  return <BecomeAModel />;
}

export default BecomeAModelPage;
