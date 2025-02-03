"use client"
import 'stories-react/dist/index.css';
import { Loader2, LucidePlus } from "lucide-react";
import Image from "next/image";
import { useState } from 'react';
import swal from 'sweetalert';
import { useUserAuthContext } from '@/lib/userUseContext';
import Link from "next/link";
import StoryPreviewComponent from './status-preview-component';
import useFetchStories from '../custom-hooks/fetch-stories';
import { Story } from '@/types/story';

const StatusComponent = () => {
    const { stories, loading } = useFetchStories();
    const { user } = useUserAuthContext()
    const prioritizedStories = stories
        ? [...stories].sort((a, b) => (a.user.id === user?.id ? -1 : b.user.id === user?.id ? 1 : 0))
        : [];
    return (
        <div className="select-none border-b">
            <div
                className="flex items-center gap-4 overflow-x-auto lg:overflow-hidden lg:hover:overflow-x-auto w-screen md:w-full p-4 py-6 pb-9 clean-sidebar">
                <UserStatus />
                {loading && <>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className='mr-5'>
                            <Loader2 size={30} className='animate-spin text-gray-200' />
                        </div>
                    ))}
                </>}
                {prioritizedStories && !loading && (
                    prioritizedStories.map((story, index) => (
                        <Status
                            key={index}
                            // islive={story.user.LiveStream.find()}
                            data={{
                                stories: story.stories,
                                image: story.user.profile_image,
                                name: story.user.name,
                                username: story.user.username,
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}


export const Status = ({ islive, data }: {
    islive?: boolean;
    data: {
        image: string;
        stories: Story[];
        name: string;
        username: string;
    }
}) => {
    const [storiesOpen, setStoriesOpen] = useState(false)
    const [username, setUsername] = useState<string>("")
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
                } else {
                    setUsername(data.username)
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
                    className="text-xs md:text-sm left-1/2 -translate-x-1/2 whitespace-pre absolute font-medium dark:text-gray-200 text-gray-600 text-center text-truncate max-w-20 overflow-hidden">
                    {data.name}
                </div>
            </div>
            {setStoriesOpen && <StatusModal
                stories={data.stories}
                open={storiesOpen}
                setStoriesOpen={setStoriesOpen}
            />}
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
                className="text-xs md:text-sm left-1/2 -translate-x-1/2 font-medium absolute dark:text-gray-200 text-gray-600 text-center text-truncate whitespace-pre w-20 overflow-hidden">
                Your status
            </div>
        </div>
    );
}

export const StatusModal = ({ open, setStoriesOpen, stories: userStories}: { 
    open: boolean, 
    stories: Story[], 
    setStoriesOpen: React.Dispatch<React.SetStateAction<boolean>> 
}) => {
    const stories = userStories.flatMap(story => 
        story.StoryMedia.map(media => ({ 
            type: media.media_type, 
            url: media.url, 
            duration: media.duration ? media.duration : 5000,
            created_at: media.created_at,
            user: story.user
        })) 
    );

    const closeStoryModal = async () => { 
        setStoriesOpen(false); 
    }

    return ( 
        <> 
            <div 
                className={`fixed bg-black inset-0 bg-opacity-90 z-50 w-full h-dvh md:h-screen p-3 flex items-center justify-center ${open ? "pointer-events-auto opacity-100 visible" : "opacity-0 pointer-events-none invisible"}`} 
                onClick={closeStoryModal} 
            > 
                <div className='max-w-screen-md min-h-screen flex flex-col mx-auto' 
                    onClick={(e) => e.stopPropagation()}> 
                    <StoryPreviewComponent 
                        className={"object-contain w-full h-full relative"} 
                        onAllStoriesEnd={closeStoryModal} 
                        stories={stories} 
                        key={stories.map(story => story.url).join(',')} // Adding a unique key to force re-render
                    /> 
                </div> 
            </div> 
        </> 
    ); 
}


export default StatusComponent;
