import { RespotPanelFetchProps, UserPostProps } from "@/types/components";
import { getToken } from "@/utils/cookie.get";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";

const getUniqueItems = (arr: UserPostProps[]) => {
  const uniqueMap = new Map();
  arr.forEach((item) => uniqueMap.set(item.id, item)); // Replace 'id' with the unique property
  return Array.from(uniqueMap.values());
  return arr;
};

const RepostPanelFetch = ({
  isForViewer,
  pageNumber,
  userdata,
}: RespotPanelFetchProps) => {
  const [posts, setPosts] = useState<UserPostProps[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancel: any;
    console.log("Fetching page:", pageNumber);

    setLoading(true);
    setError(false);

    const token = getToken();
    const api =
      userdata && userdata.id
        ? `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/reposts/${userdata.id}`
        : `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/my-reposts`;

    const postPerPage = parseInt(
      process.env.NEXT_PUBLIC_POST_PER_PAGE || "5",
      10
    );

    axios<any, AxiosResponse>(api, {
      method: "GET",
      params: { page: pageNumber, limit: postPerPage },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    })
      .then((res) => {
        const { data } = res.data;
        console.log("Fetched data:", data);

        setPosts((prevPosts) => {
          if (data.length === 0 && prevPosts.length === 0) {
            setHasMore(false);
            setLoading(false);
            setTotalResults(0);
            return [];
          }

          setTotalResults(res.data.total);
          const newPosts = getUniqueItems([...prevPosts, ...data]);
          setHasMore(data.length > 0 && newPosts.length < res.data.total);
          setLoading(false);
          return newPosts;
        });
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setError(true);
        setLoading(false);
      });

    return () => cancel();
  }, [pageNumber, userdata]); // Removed posts.length from dependencies

  return { posts, loading, error, hasMore, totalResults };
};

export default RepostPanelFetch;
