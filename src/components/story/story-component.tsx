"use client";
import { SelectMoreProps } from "@/types/components";
import { LucideArrowRight, LucideCheck, LucidePlay, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import StoryMediaPanel from "@/components/story/story-media-panel";
import { useStoryStore } from "../../contexts/story-context";
import StoryUploadForm from "../sub_components/story-upload-form";
import StoryCaptionComponent from "./story-caption-component";

function StoryComponent() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [openMore, setOpenMore] = useState<boolean>(true);
  const [openStoryCaption, setStoryCaption] = useState(false);
  const { story, removeFromStory } = useStoryStore();

  const media = useMemo(() => story, [story]);

  const handleOpenMore = useCallback(() => {
    setOpenMore((prev) => !prev);
  }, []);

  const closeStoryComponent = useCallback(() => {
    setStoryCaption(false);
  }, []);

  const handleSubmitStory = useCallback(() => {
    if (media.length > 0) {
      setStoryCaption(true);
    }
  }, [media]);

  return (
    <>
      <div className="max-w-[550px] mx-auto border dark:border-gray-600 overflow-hidden py-5 rounded-lg">
        {media.length <= 0 ? (
          <div className="flex items-center justify-center dark:text-white gap-3 pb-4">
            No media selected
          </div>
        ) : (
          <div className="p-3 md:p-5">
            <div className="grid grid-cols-3 gap-3 mb-3 p-1 overflow-y-auto">
              {media.map((data: any) => (
                <div key={data.id}>
                  <div className="bg-gray-200 w-full aspect-square rounded-lg flex items-center justify-center relative outline-2 duration-500 outline outline-primary-dark-pink">
                    <button
                      onClick={() => removeFromStory(data.id)}
                      className="absolute cursor-pointer z-50 top-0 right-0 bg-red-500 p-1 rounded-full m-1 shadow-white"
                    >
                      <X strokeWidth={2} stroke="#fff" />
                    </button>
                    {data.media_type === "video" ? (
                      <>
                        <video
                          src={data.media_url}
                          muted
                          className="object-cover rounded-xl cursor-pointer ease-in-out duration-300 inset-0 w-full h-full"
                        ></video>
                        <span className="absolute top-0 left-0 bg-primary-dark-pink p-1 rounded-full m-1 shadow-lg shadow-white">
                          <LucidePlay fill="#fff" strokeWidth={0} size={15} />
                        </span>
                      </>
                    ) : (
                      <Image
                        src={data.media_url}
                        alt={data.media_url}
                        fill
                        sizes="(max-width: 640px) 100vw, 640px"
                        className="object-cover ease-in-out duration-300 cursor-pointer rounded-xl"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <button
                onClick={handleSubmitStory}
                className="flex items-center justify-center gap-3 p-2 md:p-4 bg-primary-dark-pink text-white rounded-full ml-auto"
              >
                <LucideArrowRight size={20} strokeWidth={4} />
              </button>
            </div>
          </div>
        )}
        <SelectMoreItems openMore={openMore} handleOpenMore={handleOpenMore} />
      </div>
      {openStoryCaption && (
        <StoryCaptionComponent close={closeStoryComponent} />
      )}
    </>
  );
}

const SelectMoreItems = React.memo(
  ({ openMore, handleOpenMore }: SelectMoreProps) => {
    const [tabIndex, setTabIndex] = useState(0);
    return (
      <div className="border-t dark:border-gray-700 max-w-[550px] relative mx-auto bottom-0 left-0 z-20 dark:bg-gray-900 bg-white w-full transition-all duration-300 ease-in-out flex-1 h-[60vh]">
        <Tabs
          selectedIndex={tabIndex}
          onSelect={setTabIndex}
          className="flex flex-col h-[560px] relative dark:bg-gray-900 dark:text-white"
          selectedTabClassName="bg-coins-card-bottom dark:text-black"
        >
          <TabList className="flex items-center text-center border-bx">
            <Tab className="flex-1 outline-none cursor-pointer duration-300 transition-all">
              <span className="block p-1 md:p-2 text-sm font-medium">New</span>
            </Tab>
            <Tab className="flex-1 text-center outline-none cursor-pointer duration-300 transition-all">
              <span className="block p-1 md:p-2 text-sm font-medium">
                My Media
              </span>
            </Tab>
          </TabList>
          <TabPanel className="flex flex-col overflow-auto">
            <StoryUploadForm />
          </TabPanel>
          <TabPanel className="flex flex-col overflow-auto">
            <StoryMediaPanel />
          </TabPanel>
        </Tabs>
      </div>
    );
  },
);

SelectMoreItems.displayName = "SelectMoreItems";

export default StoryComponent;
