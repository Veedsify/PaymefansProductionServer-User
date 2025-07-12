"use client";
import { UserData } from "@/types/Story";
import { getToken } from "@/utils/Cookie";
import axios from "axios";
import { useEffect, useState } from "react";

const useFetchStories = () => {
  const [stories, setStories] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();
  useEffect(() => {
    const fetchStories = async () => {
      const fetchStory = await axios.get(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/story/all`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const response = fetchStory.data;
      setStories(response.data);
      setLoading(false);
    };
    fetchStories();
  }, [token]);

  return { stories, loading };
};

export default useFetchStories;
