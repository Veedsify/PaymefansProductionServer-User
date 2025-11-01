"use client";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useGuestModal } from "@/contexts/GuestModalContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import {
  AuthUserProps,
  type ProfileUserProps,
} from "@/features/user/types/user";
import followUser from "@/utils/data/update/Follow";

type FollowUserProps = {
  profileuser: ProfileUserProps;
};

const FollowUserComponent: React.FC<FollowUserProps> = ({ profileuser }) => {
  const [isFollowing, setIsFollowing] = React.useState(profileuser.isFollowing);
  const [followsYou, setFollowsYou] = React.useState(profileuser.followsYou);
  const { isGuest } = useAuthContext();
  const { toggleModalOpen } = useGuestModal();
  useEffect(() => {
    setIsFollowing(profileuser.isFollowing);
    setFollowsYou(profileuser.followsYou);
  }, [profileuser.isFollowing, profileuser.followsYou]);

  const followProfile = async () => {
    if (!isGuest) {
      setIsFollowing((prev) => !prev); // Optimistic UI update
      const action = isFollowing ? "unfollow" : "follow";
      try {
        const userId = profileuser.id;
        const response = await followUser(userId, action);
        if (!response.status) {
          toast.error(response.message || `Failed to ${action} user`);
          setIsFollowing((prev) => !prev); // Revert state on error
        } else {
        }
      } catch (error) {
        console.error("Error following/unfollowing user:", error);
        toast.error(`Failed to ${action} user`);
        setIsFollowing((prev) => !prev); // Revert state on error
      }
      return;
    }
    toggleModalOpen(
      "You need to login to follow " + (profileuser?.name || "this user") + ".",
    );
  };

  let buttonLabel = "Follow";

  if (isFollowing) {
    buttonLabel = "Following";
  } else if (followsYou) {
    buttonLabel = "Follow Back";
  } else {
    buttonLabel = "Follow";
  }

  return (
    <button
      onClick={followProfile}
      className={`sm:px-4 py-1 px-2 rounded outline text-xs md:text-sm font-semibold ${
        isFollowing ? "outline outline-black text-color" : "bg-black text-white"
      }`}
    >
      {buttonLabel}
    </button>
  );
};

export default FollowUserComponent;
