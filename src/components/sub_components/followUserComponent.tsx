"use client";
import { AuthUserProps, ProfileUserProps } from "@/types/user";
import followUser from "@/utils/data/update/follow";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

type FollowUserProps = {
  profileuser: ProfileUserProps;
};

const FollowUserComponent: React.FC<FollowUserProps> = ({ profileuser }) => {
  const [isFollowing, setIsFollowing] = React.useState(profileuser.isFollowing);
  const [followsYou, setFollowsYou] = React.useState(profileuser.followsYou);

  useEffect(() => {
    setIsFollowing(profileuser.isFollowing);
    setFollowsYou(profileuser.followsYou);
  }, [profileuser.isFollowing, profileuser.followsYou]);

  const followProfile = async () => {
    setIsFollowing((prev) => !prev); // Optimistic UI update
    const action = isFollowing ? "unfollow" : "follow";
    try {
      const userId = profileuser.id;
      await followUser(userId, action);
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast.error(`Failed to ${action} user`);
      setIsFollowing((prev) => !prev); // Revert state on error
    }
  };

  let buttonLabel = "Follow";

  if (isFollowing) {
    buttonLabel = "Following";
  } else if (followsYou) {
    buttonLabel = "Follow Back";
  }

  return (
    <button
      onClick={followProfile}
      className={`sm:px-4 py-1 px-2 rounded outline text-sm font-semibold ${isFollowing
        ? "outline outline-black text-color"
        : "bg-black text-white"
        }`}
    >
      {buttonLabel}
    </button>
  );
};

export default FollowUserComponent;
