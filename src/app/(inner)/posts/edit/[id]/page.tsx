import PostEditor from "@/features/post/PostEditorOptimized";
import axios from "axios";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Post",
  description: "Edit your post content and media",
};

interface EditPostProps {
  params: Promise<{
    id: string;
  }>;
}

const EditPost = async ({ params }: EditPostProps) => {
  const id = (await params).id;
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/edit/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.status) {
      redirect("/profile");
    }

    const posts = response.data.data;

    if (!posts) {
      redirect("/profile");
    }

    return (
      <div className="h-full">
        <PostEditor posts={posts} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching post for editing:", error);
    redirect("/profile");
  }
};

export default EditPost;
