import type { Metadata } from "next";
import dynamic from "next/dynamic";

const HomePostComponent = dynamic(
  () => import("@/features/post/HomePostComponent"),
  {
    ssr: false,
    loading: () => <LoadingSpinner />,
  },
);
const StatusComponent = dynamic(() => import("@/features/story/comps/Status"), {
  ssr: false,
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
