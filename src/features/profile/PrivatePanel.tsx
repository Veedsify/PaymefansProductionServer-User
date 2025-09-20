"use client";
import { useState } from "react";
import PrivateMediaImageCard from "@/features/media/PrivateMediaImageCard";

const PrivatePanel = () => {
  const [arraySort, setArraySort] = useState<string>("all");

  const toggleThisSort = (sort: string) => {
    setArraySort(sort);
  };

  return (
    <div>
      <PrivateMediaImageCard sort={arraySort} />
    </div>
  );
};

export default PrivatePanel;
