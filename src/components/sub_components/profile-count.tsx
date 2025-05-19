"use client";

import { useState } from "react";
import { ProfileStatsComponent } from "./profile-stats-components";

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
    } else if (type === "subscriber") {
      setSubscriberOpen(!subscriberOpen);
      setFollowerOpen(false);
      setFollowingOpen(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 mb-3 flex-wrap sm:text-base text-sm select-none">
        <span
          className="flex gap-2 items-center cursor-pointer"
          onClick={() => toggleOpen("followers")}
        >
          <h1 className="font-bold text-sm">{formatNumber(followers)}</h1>
          <p className="font-medium text-gray-500 text-sm">Followers</p>
        </span>
        <span className="flex gap-2 items-center cursor-pointer"
          onClick={() => toggleOpen("following")}
        >
          <h1 className="font-bold text-sm">{formatNumber(following)}</h1>
          <p className="font-medium text-gray-500 text-sm">Following</p>
        </span>
        {isModel && subscribers != null && (
          <span className="flex gap-2 items-center cursor-pointer"
            onClick={() => toggleOpen("subscriber")}
          >
            <h1 className="font-bold text-sm">{formatNumber(subscribers)}</h1>
            <p className="font-medium text-gray-500 text-sm">Subscribers</p>
          </span>
        )}
      </div>
      {followerOpen && (
        <ProfileStatsComponent userId={userId} toggleOpen={toggleOpen} type={"followers"} />
      )}
      {followingOpen && (
        <ProfileStatsComponent userId={userId} toggleOpen={toggleOpen} type={"following"} />
      )}
      {subscriberOpen && (
        <ProfileStatsComponent userId={userId} toggleOpen={toggleOpen} type={"subscriber"} />
      )}
    </>
  );
}
