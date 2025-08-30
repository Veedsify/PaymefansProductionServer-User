"use client"
import { useCallback, useState } from "react";
import MediaPanelImageCard from "./MediaPanelImageCard";

const MediaPanel = () => {
    const [arraySort, setArraySort] = useState<string>("all")

    const toggleThisSort = useCallback((sort: string) => {
        setArraySort(sort)
    }, [setArraySort])

    return (
        <div className="py-4">
            {/* <div className="flex items-center py-3 mb-2 gap-4">
                <button
                    onClick={() => toggleThisSort("all")}
                    className={`${arraySort === "all" ? "bg-messages-unread text-primary-dark-pink" : "bg-gray-200"}
                    px-5 leading-none py-2 rounded-lg text-xs font-bold bg-gray-200`}>
                    All
                </button>
                <button
                    onClick={() => toggleThisSort("image")}
                    className={`px-5 leading-none py-2 rounded-lg text-xs font-bold ${arraySort === "image" ? "bg-messages-unread text-primary-dark-pink" : "bg-gray-200"}`}>
                    Photos
                </button>
                <button
                    onClick={() => toggleThisSort("video")}
                    className={` px-5 leading-none py-2 rounded-lg text-xs font-bold ${arraySort === "video" ? "bg-messages-unread text-primary-dark-pink" : "bg-gray-200"}`}>
                    Videos
                </button>
            </div> */}
            <MediaPanelImageCard sort={arraySort} />
        </div>
    );
}

export default MediaPanel;
