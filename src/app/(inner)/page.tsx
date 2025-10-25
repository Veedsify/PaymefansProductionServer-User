import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HomeProvider from "@/providers/HomeProvider";
import HomePostComponent from "@/features/post/HomePostComponent";

// Lazy load StatusComponent to prevent browser-image-compression from bloating main bundle
const StatusComponent = dynamic(() => import("@/features/story/comps/Status"), {
    ssr: true,
    loading: () => (
        <div className="h-24 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
    ),
});

export const metadata: Metadata = {
    title: "Paymefans",
    description: "Explore Your Favorite Content Creators",
    keywords: "home, page, website",
};

export default function Home() {
    return (
        <HomeProvider>
            <StatusComponent />
            <HomePostComponent />
        </HomeProvider>
    );
}
