import type { Metadata } from "next";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

const HomePostComponent = dynamic(
  () => import("@/features/post/HomePostComponent"),
  {
    ssr: true,
    loading: () => <LoadingSpinner />,
  },
);
const StatusComponent = dynamic(() => import("@/features/story/comps/Status"), {
  ssr: true,
  loading: () => <LoadingSpinner />,
});
import HomeProvider from "@/providers/HomeProvider";

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
