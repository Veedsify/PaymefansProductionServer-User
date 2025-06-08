import { RespotPanelFetchProps, UserPostProps } from "@/types/Components";
import { getToken } from "@/utils/Cookie";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import _ from "lodash";

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
        ? `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/other/reposts/${userdata.id}`
        : `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/personal/reposts`;

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
        setPosts((prev) => _.uniqBy([...prev, ...data], "post_id"));
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
