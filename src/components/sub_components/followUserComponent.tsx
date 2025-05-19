"use client";
import { AuthUserProps, ProfileUserProps } from "@/types/user";
import React, { useEffect } from "react";

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

  const followProfile = () => {
    // TODO: Call your follow/unfollow API
    // Toggle state for demo purposes
    setIsFollowing((prev) => !prev);
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
