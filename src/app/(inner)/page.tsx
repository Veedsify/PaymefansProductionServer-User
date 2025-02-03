import HomePostComponent from "@/components/route_component/home-post-component";
import PostComponent from "@/components/route_component/post_component";
import StatusComponent from "@/components/route_component/status";
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
