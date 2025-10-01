"use client";
import axiosInstance from "@/utils/Axios";
import { useQuery } from "@tanstack/react-query";
const useFetchStories = () => {
  const { data: stories = [], isLoading: loading } = useQuery({
    queryKey: ["personal-stories"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/story/all`);
      return response.data.data;
    },
  });

  return { stories, loading };
};

export default useFetchStories;
