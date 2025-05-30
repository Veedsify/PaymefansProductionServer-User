import HomePostComponent from "@/components/post/HomePostComponent";
import StatusComponent from "@/components/story/Status";
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
