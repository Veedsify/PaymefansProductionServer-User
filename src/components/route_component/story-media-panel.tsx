"use client"
import React, { LegacyRef, MutableRefObject, RefObject, use, useEffect, useRef, useState } from "react";
import StoryMediaFetch from "@/components/custom-hooks/story-media-fetch";
import { LucideCheck, LucideLoader, LucidePlay } from "lucide-react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { useStoryStore } from "@/contexts/story-context";

const StoryMediaPanel = () => {
    const [page, setPage] = useState<number>(1)
    const { loading, error, hasMore, media } = StoryMediaFetch({ page })
    const { ref, inView } = useInView({
        threshold: 1
    })

    useEffect(() => {
        if (inView && hasMore) {
            setPage(page + 1)
        }
    }, [inView, page, hasMore])

    if (error) {
        return (
            <div className={"p-5 text-red-500"}>
                Sorry an error occured while fetching your media
            </div>
        )
    }
    return (
        <>
            <div className="grid grid-cols-3 gap-3 p-3 md:p-5 pb-10 max-h-[400px]">
                {media.map((data: any, index: number) => {
                    return <div
                        key={data.id}
                        ref={index === media.length - 1 ? ref : null}
                    >
                        <StoryMediaItem data={data} key={data.id} />
                    </div>
                })}
            </div>
            {loading && (
                <div className="px-4">
                    <LucideLoader size={30} className={"animate-spin"} fill={"#CC0DF8"} />
                </div>
            )}
            {media.length === 0 && !loading && (
                <div className="p-5 text-center text-gray-500">
                    No media found
                </div>
            )}
            {/* <button
                    className="absolute group bottom-10 right-6 flex items-center justify-center gap-3 p-2 md:p-4 bg-primary-dark-pink text-white rounded-full ml-auto overflow-hidden z-20">
                    <LucideCheck size={25} strokeWidth={3} />
                    <span className="text-sm font-bold duration-300 w-[0px] text-nowrap group-hover:w-28 group-hover:opacity-100 opacity-0">
                        Mark as selected
                    </span>
                </button> */}
            {/* {!hasMore && <div className={"p-5"}>End Of Media</div>} */}
        </>
    )
}

const StoryMediaItem = ({ data }: { data: any }) => {
    const [selected, setSelected] = useState(false)
    const { removeFromStory, addToStory, story } = useStoryStore();
    useEffect(() => {
        if (story.find((story) => story.id === data.id)) {
            setSelected(true)
        }
    }, [story, data.id])

    const handleSelect = () => {
        if (selected === false) {
            setSelected(true);
            addToStory({
                id: data.id,
                media_type: data.media_type,
                media_url: data.url
            })
        } else {
            setSelected(false);
            removeFromStory(data.id)
        }
    }

    return (
        <div
            className={`bg-gray-200 w-full aspect-square rounded-lg flex items-center justify-center relative outline-2 duration-500 outline ${selected ? "outline-primary-dark-pink" : "outline-transparent"}`}>
            {data.media_type === "video" ? (
                <>
                    {selected && <LucideCheck stroke={"#fff"} size={45} className={"z-10 absolute"} onClick={handleSelect} />}
                    <video onClick={handleSelect} src={data.url} muted
                        className={`object-cover rounded-xl cursor-pointer ${selected && "p-[2px] saturate-100"} ease-in-out saturate-0 duration-300 inset-0 w-full h-full`}>
                    </video>
                    <span
                        className={"absolute top-0 left-0 bg-primary-dark-pink p-1 rounded-full m-1 shadow-lg shadow-white"}>
                        <LucidePlay fill={"#fff"} strokeWidth={0} size={15} />
                    </span>
                </>
            ) : (
                <>
                    {selected && <LucideCheck stroke={"#fff"} size={45} className={"z-10"} onClick={handleSelect} />}
                    <Image src={data.url} alt={data.url} fill
                        sizes="(max-width: 640px) 100vw, 640px"
                        className={`object-cover ${selected && "p-[2px] saturate-100"} ease-in-out saturate-0 duration-300 cursor-pointer rounded-xl`}
                        onClick={handleSelect} />
                </>
            )}
        </div>
    )
}

export default StoryMediaPanel