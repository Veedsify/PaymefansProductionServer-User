"use client";
import axios, { CancelToken } from "axios";
import lodash from "lodash";
import { useEffect, useState } from "react";
import type { StoryMediaFetchProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";

const StoryMediaFetch = ({ page }: StoryMediaFetchProps) => {
  const [media, setMedia] = useState<any>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const URL = `/stories/media`;
    let cancel;
    axiosInstance({
      url: URL,
      method: "GET",
      params: {
        page,
      },
      // @ts-expect-error
      cancelToken: new CancelToken((c: any) => (cancel = c)),
    })
      .then((res) => {
        setHasMore(res.data.hasMore);
        setLoading(false);
        setMedia((prev: any) => {
          return lodash.uniqBy([...prev, ...res.data.data], "id");
        });
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log("Request canceled", error.message);
        } else {
          console.error("Error fetching data:", error);
        }
        setLoading(false);
        setError(true);
      });
  }, [page]);

  return {
    media,
    loading,
    error,
    hasMore,
  };
};

export default StoryMediaFetch;
