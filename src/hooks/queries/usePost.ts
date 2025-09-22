import { useQuery } from "@tanstack/react-query";
import { fmt } from "@/constants/path";
import axiosInstance from "@/utils/Axios";

const fetchPost = async (postId: string) => {
  const response = await axiosInstance.post(fmt(`/post/single/%s`, postId), {});
  return response.data.data;
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId,
    staleTime: 0, 
    retry: 1,
  });
};
