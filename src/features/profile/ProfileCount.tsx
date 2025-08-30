"use client";

import { useState } from "react";
import { ProfileStatsComponent } from "./ProfileStatsComponent";

function formatNumber(num: number = 0): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toLocaleString();
}
export function ProfileCounts({
  followers,
  following,
  subscribers,
  isModel,
  userId,
}: {
  followers: number;
  following: number;
  subscribers?: number;
  isModel: boolean;
  userId?: string;
}) {
  const [followerOpen, setFollowerOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [subscriberOpen, setSubscriberOpen] = useState(false);

  const toggleOpen = (type: string) => {
    if (type === "followers") {
      setFollowerOpen(!followerOpen);
      setFollowingOpen(false);
      setSubscriberOpen(false);
    } else if (type === "following") {
      setFollowingOpen(!followingOpen);
      setFollowerOpen(false);
      setSubscriberOpen(false);
    } else if (type === "subscribers") {
      setSubscriberOpen(!subscriberOpen);
      setFollowerOpen(false);
      setFollowingOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap mb-3 text-sm select-none gap-2 sm:text-base dark:text-white">
        <span
          className="flex items-center cursor-pointer gap-2"
          onClick={() => toggleOpen("followers")}
        >
          <h1 className="text-sm font-bold">{formatNumber(followers)}</h1>
          <p className="text-sm font-medium text-gray-500">Followers</p>
        </span>
        <span
          className="flex items-center cursor-pointer gap-2"
          onClick={() => toggleOpen("following")}
        >
          <h1 className="text-sm font-bold">{formatNumber(following)}</h1>
          <p className="text-sm font-medium text-gray-500">Following</p>
        </span>
        {isModel && subscribers != null && (
          <span
            className="flex items-center cursor-pointer gap-2"
            onClick={() => toggleOpen("subscribers")}
          >
            <h1 className="text-sm font-bold">{formatNumber(subscribers)}</h1>
            <p className="text-sm font-medium text-gray-500">Subscribers</p>
          </span>
        )}
      </div>
      {followerOpen && (
        <ProfileStatsComponent
          userId={userId}
          toggleOpen={toggleOpen}
          type={"followers"}
        />
      )}
      {followingOpen && (
        <ProfileStatsComponent
          userId={userId}
          toggleOpen={toggleOpen}
          type={"following"}
        />
      )}
      {subscriberOpen && (
        <ProfileStatsComponent
          userId={userId}
          toggleOpen={toggleOpen}
          type={"subscribers"}
        />
      )}
    </>
  );
}
