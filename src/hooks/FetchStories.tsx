"use client";
import { UserData } from "@/features/story/types/story";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import axios from "axios";
import { useEffect, useState } from "react";

const useFetchStories = () => {
  const [stories, setStories] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStories = async () => {
      const fetchStory = await axiosInstance.get(`/story/all`, {
        withCredentials: true,
      });
      const response = fetchStory.data;
      setStories(response.data);
      setLoading(false);
    };
    fetchStories();
  }, []);

  return { stories, loading };
};

export default useFetchStories;
