import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/Axios";
export const usePost = (postId: string) => {
    return useQuery({
        queryKey: ["post", postId],
        queryFn: async () => {
            const response = await axiosInstance.get(
                `/post/single/${postId}`,
            );
            if (response.data.status === false) {
                throw new Error("Post not found");
            }
            return response.data.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 1,
    });
};
