"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import UserFollowComp from "../sub_components/UserFollowComp";
import { getToken } from "@/utils/Cookie";
import { Followers, PaginateProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";

const FollowersDisplay = () => {
  const [paginate, setPaginate] = useState<PaginateProps>({
    min: 1,
    max: 30,
  });
  const [followers, setFollowers] = useState<Followers[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const arr = new Array(30).fill(0);
  const fetchFollowers = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axiosInstance.post(
        `/follower/all?min=${paginate.min}&max=${paginate.max}`,
        {},
      );
      const data = response.data;
      setFollowers((prev) => {
        const remaining = data.followers.filter((follower: Followers) => {
          return !prev.some((f) => f.user.id === follower.user.id);
        });
        return [...prev, ...remaining];
      });
    } catch (err) {
      console.log(err);
    }
  }, [paginate.min, paginate.max]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);
  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        if (
          ref.current.scrollTop + ref.current.clientHeight + 100 >=
          ref.current.scrollHeight
        ) {
          setPaginate((prevPaginate) => ({
            min: prevPaginate.min + 30,
            max: prevPaginate.max + 30,
          }));
        }
      }
    };

    const scrollRef = ref.current;

    if (scrollRef) {
      scrollRef.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollRef) {
        scrollRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, [paginate, ref]); // Include paginate in the dependency array

  useEffect(() => {
    fetchFollowers();
  }, [paginate, fetchFollowers]); // Fetch followers whenever paginate changes

  return (
    <div className="p-2 md:p-4 overflow-y-auto max-h-[92vh]" ref={ref}>
      {followers.length === 0 && (
        <div>
          <p className="text-xl font-medium text-center">No followers</p>
        </div>
      )}
      {followers.map((follower, index) => (
        <UserFollowComp key={index} follower={follower} />
      ))}
    </div>
  );
};

export default FollowersDisplay;
