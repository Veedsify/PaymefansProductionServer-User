"use client";
import axiosInstance from "@/utils/Axios";
import { useQuery } from "@tanstack/react-query";
import type { Story } from "@/features/story/types/story";

const useFetchUserStories = (username: string, enabled: boolean = true) => {
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["user-stories", username],
    queryFn: async () => {
      const response = await axiosInstance.get(`/story/user/${username}`);
      return response.data;
    },
    enabled: enabled && !!username,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  const stories: Story[] = data?.data?.stories || [];
  const hasStories = stories.length > 0;
  const user = data?.data?.user;

  return { stories, loading, hasStories, error, user };
};

export default useFetchUserStories;
