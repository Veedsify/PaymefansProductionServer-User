"use client";
import { useState } from "react";
import type { ProfileUserProps } from "@/features/user/types/user";
import MediaPanelImageCardOther from "./MediaPanelImageCardOther";

const MediaPanelOther = ({ userdata }: { userdata: ProfileUserProps }) => {
  const [arraySort, setArraySort] = useState("all");

  const toggleThisSort = (sort: string) => {
    setArraySort(sort);
  };

  return (
    <div>
      <MediaPanelImageCardOther sort={arraySort} userdata={userdata} />
    </div>
  );
};

export default MediaPanelOther;
