"use client";
import { useCallback, useState } from "react";
import MediaPanelImageCard from "./MediaPanelImageCard";

const MediaPanel = () => {
  const [arraySort, setArraySort] = useState<string>("all");

  const toggleThisSort = useCallback(
    (sort: string) => {
      setArraySort(sort);
    },
    [setArraySort],
  );

  return (
    <div className="py-2">
      <MediaPanelImageCard sort={arraySort} />
    </div>
  );
};

export default MediaPanel;
