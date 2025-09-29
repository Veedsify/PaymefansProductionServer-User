"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import followUser from "@/utils/data/update/Follow";

const FollowButton = ({
  user,
}: {
  user: { id: number; following: boolean };
}) => {
  const [isFollowing, setIsFollowing] = useState(user.following);

  useEffect(() => {
    setIsFollowing(user.following);
  }, [user.following]);

  const handleFollow = async () => {
    setIsFollowing(!isFollowing);
    try {
      const action = isFollowing ? "unfollow" : "follow";
      const response = await followUser(user.id, action);
      if (!response.status) {
        setIsFollowing((prev) => !prev);
        toast.error(response.message || "Failed to update follow status", {
          id: "follow-unfollow-toast",
        });
      }
    } catch (error: any) {
      console.error("Error following/unfollowing user:", error);
      setIsFollowing(!isFollowing);
    }
  };

  return (
    <button
      onClick={handleFollow}
      className={`w-full py-3.5 ${
        isFollowing
          ? "bg-transparent hover:bg-black hover:text-white text-black dark:text-white border"
          : "bg-primary-dark-pink hover:bg-primary-text-dark-pink text-white"
      } rounded-xl text-sm font-semibold cursor-pointer`}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;
