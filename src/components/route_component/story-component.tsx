"use client"
import { SelectMoreProps } from "@/types/components";
import { LucideArrowRight, LucideCheck, LucidePlay, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { HiCamera } from "react-icons/hi";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import StoryMediaPanel from "@/components/route_component/story-media-panel";
import { useStoryStore } from '../../contexts/story-context';
import StoryUploadForm from "../sub_components/story-upload-form";
import StoryCaptionComponent from "./story-caption-component";

function StoryComponent() {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [openMore, setOpenMore] = React.useState<boolean>(true);
    const [media, setMedia] = React.useState<any[]>([]);
    const { story, removeFromStory } = useStoryStore();
    const [openStoryCaption, setStoryCaption] = useState(false)
    useEffect(() => {
        setMedia(story);
    }, [story]);

    const handleOpenMore = () => {
        setOpenMore(!openMore)
    }
    const closeStoryComponent = () => {
        setStoryCaption(false)
    }

    const handleSubmitStory = () => {
        if(media.length <= 0) return;
        setStoryCaption(true);
    }

    return (
        <>
            <div className=" max-w-[550px] mx-auto border overflow-hidden py-5 rounded-lg">
                {media.length <= 0 ? (<div className="flex items-center justify-center gap-3 pb-4">
                    No media selected
                </div>) : (
                    <div className="p-3 md:p-5">
                        <div className="grid grid-cols-3 gap-3 mb-3 p-1 overflow-y-auto">
                            {media.map((data: any, index: number) => {
                                return <div
                                    key={data.id}
                                >
                                    <div
                                        className={`bg-gray-200 w-full aspect-square rounded-lg flex items-center justify-center relative outline-2 duration-500 outline outline-primary-dark-pink`}>
                                        <button
                                            onClick={() => removeFromStory(data.id)}
                                            className="absolute cursor-pointer z-50 top-0 right-0 bg-red-500 p-1 rounded-full m-1  shadow-white">
                                            <X strokeWidth={2} stroke="#fff" />
                                        </button>
                                        {data.media_type === "video" ? (
                                            <>
                                                <video onClick={() => { }} src={data.media_url} muted
                                                    className={`object-cover rounded-xl cursor-pointer ease-in-out duration-300 inset-0 w-full h-full`}>
                                                </video>
                                                <span
                                                    className={"absolute top-0 left-0 bg-primary-dark-pink p-1 rounded-full m-1 shadow-lg shadow-white"}>
                                                    <LucidePlay fill={"#fff"} strokeWidth={0} size={15} />
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Image src={data.media_url} alt={data.media_url} fill
                                                    sizes="(max-width: 640px) 100vw, 640px"
                                                    className={`object-cover ease-in-out duration-300 cursor-pointer rounded-xl`}
                                                    onClick={() => { }} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            })}
                        </div>
                        <div>
                            <button
                                onClick={handleSubmitStory}
                                className="flex items-center justify-center gap-3 p-2 md:p-4 bg-primary-dark-pink text-white rounded-full ml-auto">
                                <LucideArrowRight size={20} strokeWidth={4} />
                            </button>
                        </div>
                    </div>)}
                <SelectMoreItems openMore={openMore} handleOpenMore={handleOpenMore} />
            </div>
            {openStoryCaption && <StoryCaptionComponent  close={closeStoryComponent}/>}
        </>
    );
}


export const SelectMoreItems = ({ openMore, handleOpenMore }: SelectMoreProps) => {
    const [tabIndex, setTabIndex] = useState(0);
    return (
        <div className={`border-t max-w-[550px] relative mx-auto bottom-0 left-0 z-20 bg-white w-full transition-all duration-300 ease-in-out flex-1 h-[60vh]`}>
            {/* <div className="flex justify-end items-center pb-6 p-3 md:p-5">
            <button onClick={handleOpenMore}>
                    <X size={30} strokeWidth={2} />
                </button>
            </div> */}
            <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)} className="flex flex-col h-[560px] relative" selectedTabClassName="bg-coins-card-bottom">
                <TabList className="flex items-center text-center border-bx">
                    <Tab className="flex-1 outline-none cursor-pointer duration-300 transition-all">
                        <span className="block p-1 md:p-2 text-sm font-medium">New</span>
                    </Tab>
                    <Tab className="flex-1 text-center outline-none cursor-pointer duration-300 transition-all">
                        <span className="block p-1 md:p-2 text-sm font-medium">My Media</span>
                    </Tab>
                </TabList>
                <TabPanel className={`flex flex-col ${tabIndex === 0 && "flex-1"} overflow-auto`}>
                    <StoryUploadForm />
                </TabPanel>
                <TabPanel className={`flex flex-col ${tabIndex === 1 && "flex-1"} overflow-auto`}>
                    <StoryMediaPanel />
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default StoryComponent;