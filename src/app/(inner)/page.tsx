import HomePostComponent from "@/features/post/HomePostComponent";
import StatusComponent from "@/features/story/comps/Status";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paymefans",
  description: "Explore Your Favorite Content Creators",
  keywords: "home, page, website",
};

export default function Home() {
  return (
    <>
      <StatusComponent />
      <HomePostComponent />
    </>
  );
}
