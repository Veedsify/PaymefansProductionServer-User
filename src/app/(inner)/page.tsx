import type { Metadata } from "next";
import StatusComponent from "@/features/story/comps/Status";
import HomeProvider from "@/providers/HomeProvider";
import HomePostComponent from "@/features/post/HomePostComponent";

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
