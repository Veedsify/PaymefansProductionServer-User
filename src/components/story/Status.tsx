"use client";
import { Loader2, LucidePlus } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import swal from "sweetalert";
import { useUserAuthContext } from "@/lib/UserUseContext";
import useFetchStories from "../custom-hooks/FetchStories";
import { Story } from "@/types/Story";
import StatusModal from "./StatusModal";
import UserStatus from "@/components/story/UserStatus";

const StatusComponent = () => {
  const { stories, loading } = useFetchStories();
  const { user } = useUserAuthContext();
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
        a.user.id === user?.id ? -1 : b.user.id === user?.id ? 1 : 0,
      )
    : [];
  return (
    <div ref={storyContainer} className="select-none border-b border-black/30">
      <div
        className="flex items-center gap-4 p-4 py-6 pb-9 clean-sidebar whitespace-nowrap"
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
                <Loader2 size={30} className="animate-spin text-gray-200" />
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
  const { user } = useUserAuthContext();

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
      <div className="block relative" onClick={OpenThisStory}>
        <div
          className={`flex items-center ${
            islive ? "bg-red-300" : "bg-gray-300"
          } flex-shrink-0 justify-center cursor-pointer rounded-full aspect-square h-20 w-20 md:h-[94px] md:w-[94px] relative mb-2`}
        >
          {islive && (
            <div className="absolute rounded-full w-2/3 h-2/3 border border-red-600 animate-ping"></div>
          )}
          <div className="flex p-[5px] bg-white items-center justify-center rounded-full">
            <Image
              width={80}
              height={80}
              priority
              src={data.image}
              className={`rounded-full w-auto border-2 ${
                islive ? "border-red-600" : "border-gray-300"
              } object-cover h-16 md:h-20 aspect-square`}
              alt=""
            />
          </div>
          {islive && (
            <div className="rounded-md p-[2px] bg-red-600 text-white text-xs border border-white absolute -bottom-2 scale-90">
              <p className="text-xs font-bold">LIVE</p>
            </div>
          )}
        </div>
        <div className="text-xs md:text-sm left-1/2 -translate-x-1/2 whitespace-pre absolute font-medium dark:text-gray-200 text-gray-600 text-center text-truncate max-w-20 overflow-hidden">
          {data.name}
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
