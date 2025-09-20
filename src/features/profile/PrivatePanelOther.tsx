"use client";
import { useState } from "react";
import PrivateMediaImageCardOther from "@/features/media/PrivateMediaImageCardOther";
import type { ProfileUserProps } from "@/features/user/types/user";

const PrivatePanelOther = ({ userdata }: { userdata: ProfileUserProps }) => {
  const [arraySort, setArraySort] = useState("all");

  const toggleThisSort = (sort: string) => {
    setArraySort(sort);
  };

  return (
    <div>
      <PrivateMediaImageCardOther sort={arraySort} userdata={userdata} />
    </div>
  );
};

export default PrivatePanelOther;
