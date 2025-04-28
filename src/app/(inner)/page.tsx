import HomePostComponent from "@/components/post/home-post-component";
import StatusComponent from "@/components/story/status";
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
