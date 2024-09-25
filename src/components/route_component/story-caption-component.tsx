import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// import required modules
import { Navigation, Pagination } from 'swiper/modules';
import { StoryType, useStoryStore } from '@/contexts/story-context';

import Image from 'next/image';
import { FileSignature, LucideSend, Text } from 'lucide-react';
import { StoryCaptionComponentProps } from '@/types/components';

const StoryCaptionComponent = ({ close }: StoryCaptionComponentProps) => {
     const { story, addcCaptionToStory } = useStoryStore();

     return (
          <div
               className="flex flex-col items-center fixed justify-center inset-0 w-full min-h-screen bg-opacity-80 bg-black z-50 select-none">
               <div
                    className="p-3 bg-white w-full ">
                    <h2
                         className="text-2xl text-center font-bold"
                    >
                         Story Caption
                    </h2>
               </div>
               <div className="p-3 flex aspect-[9/15] md:h-[90%] flex-1 w-full"
                    onClick={(e) => {
                         if (e.target === e.currentTarget) {
                              close()
                         }
                    }}
               >
                    {/* <div className=""> */}
                    <Swiper
                         navigation={true}
                         pagination={true}
                         modules={[Navigation, Pagination]}
                         className="mySwiper max-w-[520px] aspect-[9/15] h-[90%] mx-auto object-contain bg-white border p-3 rounded-lg">
                         {story?.map((story, index) => (
                              <SwiperSlide
                                   key={index}
                              >
                                   <SlideComponent story={story} index={index} />
                              </SwiperSlide>
                         ))}
                    </Swiper>
                    {/* </div> */}
               </div>
          </div>
     );
}

const SlideComponent = ({ story }: { story: StoryType, index: number }) => {
     const { addcCaptionToStory } = useStoryStore();
     return (
          <div className="flex relative flex-col items-center justify-center h-full w-full">
               <div className='absolute flex items-center justify-between top-0 left-0 w-full z-50 px-5 py-3 backdrop-blur-sm bg-white bg-opacity-10'>
                    <button className='p-3 rounded-full bg-primary-dark-pink'>
                         <FileSignature stroke='#fff' />
                    </button>
                    <button className='p-3 rounded-full bg-primary-dark-pink'>
                         <LucideSend stroke='#fff' />
                    </button>
               </div>
               {story?.media_type === "video" && (<video
                    controlsList='nodownload noremoteplayback nofullscreen nopip noplaybackrate'
                    preload='auto'
                    src={story?.media_url} controls className="h-full w-full object-contain rounded-lg brightness-75 bg-black" />)}
               {story?.media_type === "image" && (<Image src={story?.media_url} alt={story?.caption ? story.caption : "status"} width={800} height={800} className="h-full w-full object-contain rounded-lg brightness-75 bg-black" />)}
               <textarea
                    onInput={(e) => {
                         e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
                    }}
                    onChange={(e) => {
                         addcCaptionToStory(story.id, e.target.value);
                    }}
                    style={{
                         fontFamily: story?.captionStyle?.fontFamily,
                         fontSize: story?.captionStyle?.fontSize,
                         fontWeight: story?.captionStyle?.fontWeight,
                         color: story?.captionStyle?.color,
                    }}
                    placeholder="Add Caption" className="p-2 w-full rounded-lg bg-transparent backdrop:blur-sm text-white border-none outline-none text-center text-3xl h-auto font-semibold leading-relaxed absolute resize-none ">{story?.caption && story.caption}</textarea>
          </div>
     )
}
export default StoryCaptionComponent;