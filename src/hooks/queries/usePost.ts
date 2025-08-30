import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/Axios";
import { fmt } from "@/constants/path";
export const usePost = (postId: string) => {
    return useQuery({
        queryKey: ["post", postId],
        queryFn: async () => {
            const response = await axiosInstance.get(
                fmt(`/post/single/%s`, postId),
            );
            return response.data.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 1,
    });
};
