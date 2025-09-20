import { UploadProgressProvider } from "@/contexts/UploadProgressContext";
import { PostProviderWrapper } from "@/providers/PostProviderWrapper";

const PostLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UploadProgressProvider>
      <PostProviderWrapper>{children}</PostProviderWrapper>
    </UploadProgressProvider>
  );
};

export default PostLayout;
