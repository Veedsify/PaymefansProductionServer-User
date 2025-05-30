import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
// import required modules
import { Navigation, Pagination } from "swiper/modules";
import { StoryType, useStoryStore } from "@/contexts/story-context";

import Image from "next/image";
import { FileSignature, LucideSend, Text } from "lucide-react";
import { StoryCaptionComponentProps } from "@/types/components";
import { useState } from "react";
import SubmitUserStory from "@/utils/story/submit-user-story";
import toast from "react-hot-toast";
import { fontFamilies } from "@/lib/story/fontfamilies";

const StoryCaptionComponent = ({ close }: StoryCaptionComponentProps) => {
  const { story, addcCaptionToStory } = useStoryStore();
  return (
    <div className="flex flex-col items-center fixed justify-center inset-0 w-full min-h-dvh bg-black/80 z-50 select-none">
      <div
        className="p-3 flex justify-center items-center w-full flex-1"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            close();
          }
        }}
      >
        <Swiper
          navigation={true}
          pagination={true}
          modules={[Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          className="max-w-[520px] w-full aspect-[9/16] bg-white border rounded-lg overflow-hidden"
        >
          {story?.map((story, index) => (
            <SwiperSlide key={index} className="h-full w-full">
              <SlideComponent story={story} index={index} close={close} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

const SlideComponent = ({
  story,
  close,
}: {
  story: StoryType;
  index: number;
  close: () => void;
}) => {
  const {
    addcCaptionToStory,
    updateCaptionStyle,
    story: mystory,
    clearStory,
  } = useStoryStore();
  const [fontIndex, setFontIndex] = useState(0);

  const changeFont = () => {
    const nextFont = fontFamilies[fontIndex];
    setFontIndex((fontIndex + 1) % fontFamilies.length); // Cycle through the fonts
    updateCaptionStyle(story.id, {
      fontFamily: nextFont,
      fontSize: "1.875rem",
      fontWeight: "bold",
      color: "#fff",
    });
  };

  const submitStory = async () => {
    const submit = await SubmitUserStory(mystory);
    if (submit.success) {
      toast.success("Story uploaded successfully");
      close();
      clearStory();
      return;
    }
  };

  return (
    <div className="flex relative flex-col items-center justify-center h-full w-full">
      <div className="absolute flex items-center justify-between top-0 left-0 w-full z-50 px-5 py-3 backdrop-blur-sm bg-white/10">
        <button
          onClick={changeFont}
          className="p-3 rounded-full bg-primary-dark-pink cursor-pointer"
        >
          <FileSignature stroke="#fff" />
        </button>
        <button
          onClick={submitStory}
          className="p-3 rounded-full bg-primary-dark-pink"
        >
          <LucideSend stroke="#fff" />
        </button>
      </div>
      {story?.media_type === "video" && (
        <video
          controlsList="nodownload noremoteplayback nofullscreen nopip noplaybackrate"
          preload="auto"
          autoPlay
          muted
          src={story?.media_url}
          controls
          className="h-full w-full object-contain rounded-lg brightness-75 bg-black"
        />
      )}
      {story?.media_type === "image" && (
        <Image
          src={story?.media_url}
          alt={story?.caption ? story.caption : "status"}
          width={800}
          height={800}
          className="h-full w-full object-contain rounded-lg brightness-75 bg-black"
        />
      )}
      <textarea
        maxLength={100}
        onInput={(e) => {
          e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
        }}
        onChange={(e) => {
          addcCaptionToStory(story.id, e.target.value);
        }}
        style={{
          fontSize: story?.captionStyle?.fontSize,
          fontWeight: story?.captionStyle?.fontWeight,
          color: story?.captionStyle?.color,
        }}
        placeholder="Add Caption"
        defaultValue={story?.caption}
        className={`p-2 w-full rounded-lg bg-transparent backdrop:blur-sm text-white border-none outline-none text-center text-3xl h-auto font-semibold leading-relaxed absolute resize-none ${story?.captionStyle?.fontFamily}`}
      ></textarea>
    </div>
  );
};
export default StoryCaptionComponent;
