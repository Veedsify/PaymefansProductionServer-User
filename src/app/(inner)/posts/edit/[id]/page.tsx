import PostEditor from "@/components/post/PostEditor";
import axiosInstance from "@/utils/Axios";
import { Metadata } from "next";
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
    const response = await axiosInstance.get(`/post/edit/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
