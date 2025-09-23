import type { Metadata } from "next";
import HomePostComponent from "@/features/post/HomePostComponent";
import dynamic from "next/dynamic";

const StatusComponent = dynamic(() => import("@/features/story/comps/Status"), {
  ssr: true,
  loading: () => <LoadingSpinner />,
});
import HomeProvider from "@/providers/HomeProvider";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

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
