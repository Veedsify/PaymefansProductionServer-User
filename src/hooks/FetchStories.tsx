"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import type { UserData } from "@/features/story/types/story";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";

const useFetchStories = () => {
  const [stories, setStories] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStories = async () => {
      const fetchStory = await axiosInstance.get(`/story/all`);
      const response = fetchStory.data;
      setStories(response.data);
      setLoading(false);
    };
    fetchStories();
  }, []);

  return { stories, loading };
};

export default useFetchStories;
