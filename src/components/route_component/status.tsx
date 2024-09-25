"use client"
import Stories from 'stories-react';
import 'stories-react/dist/index.css';
import { LucideMoveLeft, LucideMoveRight, LucidePlus } from "lucide-react";
import Image from "next/image";
import { SetStateAction, useEffect, useState } from 'react';
import Loader from './loader';
import swal from 'sweetalert';
import StoriesHeader from './stories_header';
import { useUserAuthContext } from '@/lib/userUseContext';
import Link from "next/link";
import StoryPreviewComponent from './story-preview-component';

const StatusComponent = () => {
    return (
        <div className="select-none border-b">
            <div
                className="flex items-center gap-4 overflow-x-auto lg:overflow-hidden lg:hover:overflow-x-auto w-screen md:w-full p-4 py-6 pb-9 clean-sidebar">
                <UserStatus />
                <Status islive={true}
                    data={{ image: "/images/login_image.png", story: "", name: "the_artgetteedfrw4escsdcsfer", username: "@dikewisdom" }} />
                <Status
                    data={{ image: "/images/login_image.png", story: "", name: "thora", username: "@thora"}} />
                <Status
                    islive={true} data={{ image: "/images/profilecover.png", story: "", name: "bridgette", username: "@bridgette" }} />
                {/* <Status islive={false} data={{ image: "/images/profilecover.png", story: "", name: "kimberly" }} />
                <Status islive={false} data={{ image: "/images/profilecover.png", story: "", name: "bridgette" }} />
                <Status islive={true} data={{ image: "/images/register_image.png", story: "", name: "focbos" }} />
                <Status islive={false} data={{ image: "/images/register_image.png", story: "", name: "jennermarbles" }} />
                <Status islive={true} data={{ image: "/images/register_image.png", story: "", name: "tysoncreamte" }} />
                <Status islive={false} data={{ image: "/images/register_image.png", story: "", name: "mitchell" }} />
                <Status islive={true} data={{ image: "/images/register_image.png", story: "", name: "crymson_tims" }} /> */}
            </div>
        </div>
    );
}


export const Status = ({ islive, data }: {
    islive?: boolean;
    data: {
        image: string;
        story: string;
        name: string;
        username: string;
    }
}) => {
    const [storiesOpen, setStoriesOpen] = useState(false)
    const OpenThisStory = () => {
        if (islive) {
            return swal({
                text: "Do you want to view this story? or view the live stream",
                title: "This user is live",
                icon: "info",
                buttons: ["View Story", "View Live Stream"],
            }).then((value) => {
                if (value) {
                    window.location.href = `/redirect-to-live/${data.username}`
                }else{
                    setStoriesOpen(true)
                }
            })
        }
        setStoriesOpen(true)
    }
    return (
        <div>
            <div className="block relative" onClick={OpenThisStory}>
                <div
                    className={`flex items-center ${islive ? "bg-red-300" : "bg-gray-300"} flex-shrink-0 justify-center cursor-pointer rounded-full aspect-square h-20 w-20 md:h-[94px] md:w-[94px] relative mb-2`}>
                    {islive && <div className="absolute rounded-full w-2/3 h-2/3 border border-red-600 animate-ping"></div>}
                    <div className="flex p-[5px] bg-white items-center justify-center rounded-full">
                        <Image
                            width={80}
                            height={80}
                            priority
                            src={data.image}
                            className={`rounded-full w-auto border-2 ${islive ? "border-red-600" : "border-gray-300"} object-cover h-16 md:h-20 aspect-square`}
                            alt="" />
                    </div>
                    {islive && (
                        <div
                            className="rounded-md p-[2px] bg-red-600 text-white text-xs border border-white absolute -bottom-2 scale-90">
                            <p className="text-xs font-bold">LIVE</p>
                        </div>
                    )}
                </div>
                <div
                    className="text-xs md:text-sm left-1/2 -translate-x-1/2 absolute font-medium text-gray-600 text-center text-truncate max-w-20 overflow-hidden">
                    {data.name}
                </div>
            </div>
            <StatusModal
                open={storiesOpen}
                setStoriesOpen={setStoriesOpen}
            />
        </div>
    );
}
export const UserStatus = () => {
    const { user } = useUserAuthContext()
    return (
        <div className="block relative">
            <div
                className="flex items-center bg-gray-300 flex-shrink-0 justify-center cursor-pointer rounded-full aspect-square h-20 w-20 md:h-24 md:w-24 relative mb-2">
                <div className="flex p-[5px] bg-white items-center justify-center rounded-full">
                    <Link href={"/story"}>
                        <Image
                            width={80}
                            height={80}
                            priority
                            src={user ? user.profile_image : "/site/avatar.png"}
                            className="rounded-full object-cover border-4 border-gray-300 w-auto h-16 md:h-20 aspect-square"
                            alt="" />
                    </Link>
                </div>
                <div
                    className="p-1 bg-primary-dark-pink text-white text-xs border-4 border-white absolute -bottom-0 right-0 scale-90 rounded-full">
                    <LucidePlus stroke="#fff" size={15} strokeWidth={3} />
                </div>
            </div>
            <div
                className="text-xs md:text-sm left-1/2 -translate-x-1/2 font-medium absolute text-gray-600 text-center text-truncate whitespace-pre w-20 overflow-hidden">
                Your status
            </div>
        </div>
    );
}

export const StatusModal = ({ open, setStoriesOpen }: {
    open: boolean,
    setStoriesOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const [height, setHeight] = useState(0)
    useEffect(() => {
        setHeight(window.innerHeight)
    }, [])
    const stories = [
        {
            header: <StoriesHeader />,
            type: 'video',
            url: 'https://videos.pexels.com/video-files/9968176/9968176-sd_640_360_25fps.mp4',
            duration: 10000,
        },
        {
            header: <StoriesHeader />,
            type: 'image',
            duration: 6000,
            url: 'https://images.pexels.com/photos/9733197/pexels-photo-9733197.jpeg?w=300',
        },
        {
            header: <StoriesHeader />,
            duration: 6000,
            type: 'image',
            url: 'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=600',
        },
        {
            header: <StoriesHeader />,
            duration: 6000,
            type: 'video',
            url: 'https://videos.pexels.com/video-files/5739886/5739886-sd_360_640_30fps.mp4',
        },
    ];
    const closeStoryModal = () => {
        setStoriesOpen(false)
    }

    return (
        <>
            <div
                className={`fixed bg-black inset-0 bg-opacity-90 z-50 w-full h-dvh md:h-screen p-3 flex items-center justify-center duration-300 ${open ? "pointer-events-auto visible" : "opacity-0 pointer-events-none invisible"}`}
                onClick={closeStoryModal}
           >
                <div className='max-w-screen-md min-h-screen flex flex-col mx-auto'
                    onClick={(e) => e.stopPropagation()}>
                    <StoryPreviewComponent
                        className={"object-contain flex-1 h-full aspect-[9/16] relative"}
                        onAllStoriesEnd={closeStoryModal}
                        width="auto"
                        height={String(height + 'px')}
                        stories={stories}
                    />
                </div>
            </div>
        </>
    )
}

export default StatusComponent;