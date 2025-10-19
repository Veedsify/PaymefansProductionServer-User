import axios, { type AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import type { RespotPanelFetchProps, UserPostProps } from "@/types/Components";
import { uniqBy } from "lodash-es";

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
    const api =
      userdata && userdata.id
        ? `/post/other/reposts/${userdata.id}`
        : `/post/personal/reposts`;

    const postPerPage = parseInt(
      process.env.NEXT_PUBLIC_POST_PER_PAGE || "5",
      10
    );

    axios<any, AxiosResponse>(api, {
      method: "GET",
      params: { page: pageNumber, limit: postPerPage },
      withCredentials: true,
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    })
      .then((res) => {
        const { data, hasMore } = res.data;
        console.log("Fetched data:", data);
        if (data.length === 0) {
          setHasMore(false);
          setLoading(false);
          setTotalResults(0);
          setPosts([]);
          return;
        }
        setHasMore(hasMore);
        setPosts((prev) => uniqBy([...prev, ...data], "post_id"));
        setTotalResults(res.data.total);
        setLoading(false);
      })
      .catch((e) => {
        if (axios.isCancel(e)) return;
        setError(true);
        setLoading(false);
      });

    return () => cancel();
  }, [pageNumber, userdata, setPosts]); // Removed posts.length from dependencies

  return { posts, loading, error, hasMore, totalResults };
};
export default RepostPanelFetch;
