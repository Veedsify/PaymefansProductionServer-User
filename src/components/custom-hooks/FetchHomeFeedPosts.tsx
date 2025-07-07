"use client";
import ROUTE from "@/config/routes";
import { useHomeFeedStore } from "@/contexts/HomeFeedContext";
import { fetchHomePosts } from "@/utils/data/FetchHomePost";
import { useEffect, useState } from "react";

const FetchHomeFeedPosts = () => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { addToPosts } = useHomeFeedStore();

  const updatePage = () => {
    if (hasMore && !loading) {
      setLoading(true);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (hasMore && loading) {
      const getPosts = async () => {
        try {
          setError(false);
          const API_URL = `${ROUTE.GET_HOME_POSTS}?page=${page}`;
          const usersfeed = await fetchHomePosts(API_URL);
          addToPosts(usersfeed.posts);
          setHasMore(usersfeed.hasMore);
          setLoading(false);
        } catch (error: any) {
          console.log(error);
          setError(true);
          setLoading(false);
        }
      };
      getPosts();
    }
  }, [page, hasMore, addToPosts]);

  return {
    page,
    loading,
    updatePage,
    error,
    hasMore,
  };
};

export default FetchHomeFeedPosts;
