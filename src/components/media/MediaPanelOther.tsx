"use client"
import { useState } from "react";
import MediaPanelImageCardOther from "./MediaPanelImageCardOther";
import { ProfileUserProps } from "@/types/User";

const MediaPanelOther = ({ userdata }: { userdata: ProfileUserProps }) => {
    const [arraySort, setArraySort] = useState("all")

    const toggleThisSort = (sort: string) => {
        setArraySort(sort)
    }

    return (
        <div className="">
            {/* <div className="py-3 mb-2 flex items-center gap-4">
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
            <MediaPanelImageCardOther sort={arraySort} userdata={userdata} />
        </div>
    );
}

export default MediaPanelOther;
