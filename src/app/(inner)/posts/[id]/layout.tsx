import type { Metadata } from "next";

type PostLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Posts",
};

function PostLayout({ children }: PostLayoutProps) {
  return <>{children}</>;
}

export default PostLayout;
