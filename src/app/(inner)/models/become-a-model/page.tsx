import BecomeAModel from "@/features/models/comps/BecomeAModel";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Become a model",
    description: "Profile page",
}

function BecomeAModelPage() {
    return (
        <BecomeAModel />
    );
}

export default BecomeAModelPage;