"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "@/utils/Cookie";
import {
  PostData,
  UserPostProps,
  UserPostPropsOther,
} from "@/types/Components";
import { useOtherPrivatePostsStore } from "@/contexts/PersonalPrivateContext";
const getUniqueItems = (arr: UserPostProps[]) => {
  const uniqueMap = new Map();
  arr.forEach((item) => uniqueMap.set(item.id, item)); // Replace 'id' with the unique property
  return Array.from(uniqueMap.values());
};
export default function PrivatePanelFetchOther(
  userid: number,
  pageNumber: number
) {
  const { posts, setPosts } = useOtherPrivatePostsStore();
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancel;
    setLoading(true);
    setError(false);
    const token = getToken();
    const api = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/other/private-posts/${userid}`;
    const postPerPage = process.env.NEXT_PUBLIC_POST_PER_PAGE;
    axios(api, {
      method: "GET",
      params: {
        page: pageNumber,
        limit: postPerPage,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
  }, [pageNumber, userid, setPosts]);

  return { posts, loading, error, hasMore, totalResults };
}
