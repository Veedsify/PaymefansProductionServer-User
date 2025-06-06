"use client";
import { UserData } from "@/types/Story";
import { getToken } from "@/utils/Cookie";
import { useEffect, useState } from "react";

const useFetchStories = () => {
  const [stories, setStories] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();
  useEffect(() => {
    const fetchStories = async () => {
      const fetchStory = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/story/all`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchStory.json();
      setStories(response.data);
      setLoading(false);
    };
    fetchStories();
  }, [token]);

  return { stories, loading };
};

export default useFetchStories;
