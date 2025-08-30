"use client";
import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { getToken } from "@/utils/Cookie";
import { PostData, UserPostProps } from "@/types/Components";
import { usePersonalProfileStore } from "@/contexts/PersonalProfileContext";

const getUniqueItems = (arr: UserPostProps[]) => {
  const uniqueMap = new Map();
  arr.forEach((item) => uniqueMap.set(item.id, item)); // Replace 'id' with the unique property
  return Array.from(uniqueMap.values());
};

export default function PostPanelFetch(pageNumber: number) {
  const { posts, setPosts } = usePersonalProfileStore();
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancel;
    setLoading(true);
    setError(false);
    const api = `/post/personal/posts`;
    const postPerPage = process.env.NEXT_PUBLIC_POST_PER_PAGE as string;

    axios<any, AxiosResponse>(api, {
      method: "GET",
      params: {
        page: pageNumber,
        limit: postPerPage,
      },
      withCredentials: true,
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    })
      .then((res) => {
        setPosts(res.data.data);
        setTotalResults(res.data.total);
        setHasMore(res.data.data.length > 0);
        setLoading(false);
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setError(true);
      });
  }, [pageNumber, setPosts]);

  return { posts, loading, error, hasMore, totalResults };
}
