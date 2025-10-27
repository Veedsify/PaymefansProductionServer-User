"use client";
import { Loader2, LucidePlus } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import swal from "sweetalert";
import { useAuthContext } from "@/contexts/UserUseContext";
import UserStatus from "@/features/story/comps/UserStatus";
import type { Story } from "@/features/story/types/story";
import dynamic from "next/dynamic";
const StatusModal = dynamic(() => import("./StatusModal"), { ssr: false });
import FormatName from "@/lib/FormatName";
import useFetchStories from "@/features/posts/hooks/FetchStories";

const StatusComponent = () => {
  const { stories, loading } = useFetchStories();
  const { user } = useAuthContext();
  const [maxWidth, setMaxWidth] = useState(0);
  const storyContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!storyContainer.current) return;
      const containerWidth = storyContainer.current.clientWidth;
      if (containerWidth > 0) {
        setMaxWidth(containerWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("load", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Initial measurement
    handleResize();

    return () => {
      // Clean up all event listeners
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const prioritizedStories = stories
    ? [...stories].sort((a, b) =>
        a.user.id === user?.id ? -1 : b.user.id === user?.id ? 1 : 0
      )
    : [];
  return (
    <div
      ref={storyContainer}
      className="border-b select-none border-black/30 z-50"
    >
      <div
        className="flex p-4 py-6 gap-4 pb-9 clean-sidebar whitespace-nowrap"
        style={{
          maxWidth: maxWidth,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <UserStatus />
        {loading && (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="mr-5">
                <Loader2 size={30} className="text-gray-200 animate-spin" />
              </div>
            ))}
          </>
        )}
        {prioritizedStories &&
          !loading &&
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
          ))}
      </div>
    </div>
  );
};

const Status = ({
  islive,
  data,
}: {
  islive?: boolean;
  data: {
    image: string;
    stories: Story[];
    name: string;
    username: string;
  };
}) => {
  const [storiesOpen, setStoriesOpen] = useState(false);
  const { user } = useAuthContext();

  const OpenThisStory = () => {
    if (islive) {
      return swal({
        text: "Do you want to view this story? or view the live stream",
        title: "This user is live",
        icon: "info",
        buttons: ["View Story", "View Live Stream"],
      }).then((value) => {
        if (value) {
          window.location.href = `/redirect-to-live/${data.username}`;
        } else {
          setStoriesOpen(true);
        }
      });
    }
    setStoriesOpen(true);
  };
  return (
    <div>
      <div
        className="relative flex flex-col items-center cursor-pointer z-50"
        onClick={OpenThisStory}
      >
        <div
          className={`flex items-center ${
            islive ? "bg-red-300" : "bg-gray-300"
          } flex-shrink-0 justify-center rounded-full aspect-square h-18 w-18 md:h-22 md:w-22 relative mb-2`}
        >
          {islive && (
            <div className="absolute w-2/3 border border-red-600 rounded-full h-2/3 animate-ping"></div>
          )}
          <div className="flex p-[3px] bg-primary-dark-pink items-center justify-center rounded-full aspect-square w-full h-full">
            <Image
              width={80}
              height={80}
              priority
              src={data.image}
              className="rounded-full aspect-square border-2 border-gray-200 object-cover w-full h-full"
              alt=""
            />
          </div>
          {islive && (
            <div className="rounded-md p-[2px] bg-red-600 text-white text-xs border border-white absolute -bottom-2 scale-90">
              <p className="text-xs font-bold">LIVE</p>
            </div>
          )}
        </div>
        <div className="text-xs font-medium text-center text-gray-600 whitespace-pre md:text-sm dark:text-gray-200 text-truncate max-w-20">
          {FormatName(data.name)}
        </div>
      </div>
      {setStoriesOpen && (
        <StatusModal
          stories={data.stories}
          open={storiesOpen}
          setStoriesOpen={setStoriesOpen}
        />
      )}
    </div>
  );
};

export default StatusComponent;
