import BecomeAModel from "@/components/route_component/BecomeAModel";
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