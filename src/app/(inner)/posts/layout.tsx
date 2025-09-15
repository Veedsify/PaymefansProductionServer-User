import { PostProviderWrapper } from "@/providers/PostProviderWrapper";
import { UploadProgressProvider } from "@/contexts/UploadProgressContext";

const PostLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UploadProgressProvider>
      <PostProviderWrapper>{children}</PostProviderWrapper>
    </UploadProgressProvider>
  );
};

export default PostLayout;
