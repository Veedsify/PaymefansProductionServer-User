"use client";

import { imageTypes, videoTypes } from "@/lib/FileTypes";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { generatePosterFromVideo } from "@/lib/VideoPoster";
import { getToken } from "@/utils/Cookie";
import { LucideChevronRight } from "lucide-react";
import Image from "next/image";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper } from "swiper/react";
import { SwiperSlide } from "swiper/react";
import toast from "react-hot-toast";
import { MediaPreviewProps, PreviewTypes } from "@/types/Components";
import axios from "axios";

const MediaPreviewer: React.FC<MediaPreviewProps> = ({
  files,
  setMessage,
  sendNewMessage,
  close,
  message,
}) => {
  const [mainTab, setMainTab] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewTypes[]>([]);
  const swiperRef = useRef(null); // Assuming you want to interact with the Swiper instance
  const ref = useRef<HTMLDivElement>(null);
  const token = getToken();
  const { user } = useUserAuthContext();
  const handleMainTabSelect = (file: File) => {
    setMainTab(file);
  };

  const handleAttachmentUpload = useCallback(async () => {
    if (!user) return;
    const formData = new FormData();
    const attachedFiles: File[] = Array.from(files);
    formData.append("userId", user?.user_id as string);
    attachedFiles.map((file) => {
      formData.append("attachments[]", file);
    });
    close();
    toast.loading("Uploading attachments");
    // await new Promise(resolve => setTimeout(resolve, 2000))
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/conversations/upload/attachments`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = res.data;
    sendNewMessage(data.attachments);
  }, [sendNewMessage, close, files, token, user]);

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener("input", (e: Event) => {
        const target = e.target as HTMLDivElement;
        setMessage(target.innerHTML);
      });
    }
    return () => {
      document
        .querySelector("#message-input")
        ?.removeEventListener("input", (e: Event) => {
          const target = e.target as HTMLDivElement;
          setMessage(target.innerHTML);
        });
    };
  }, [setMessage]);

  useEffect(() => {
    if (files.length > 0) {
      setMainTab(files[0]);
    }
    const generatePreviews = async (): Promise<void> => {
      const newPreviews: PreviewTypes[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (imageTypes.includes(file.type)) {
          newPreviews.push({
            type: "image",
            src: URL.createObjectURL(file),
            poster: URL.createObjectURL(file),
          });
        } else if (videoTypes.includes(file.type)) {
          const poster = await generatePosterFromVideo(file);
          newPreviews.push({
            type: "video",
            src: URL.createObjectURL(file),
            poster,
          });
        }
      }
      setPreview(newPreviews);
    };
    generatePreviews();
  }, [files, setMainTab, setPreview]);

  return (
    <>
      <div className="border rounded-2xl p-2 md:p-8 py-4 w-full sm:w-5/6 md:w-4/6 lg:w-4/6 xl:w-1/3">
        <div className="flex justify-center mb-5">
          {mainTab && <MainTabPreview mainTab={mainTab} />}
        </div>
        <Swiper
          ref={swiperRef}
          slidesPerView={5}
          spaceBetween={10}
          modules={[Navigation]}
          pagination={{ clickable: true }}
          className="h-full w-full"
        >
          {preview.map((file, index) => (
            <SwiperSlide key={index} className="cursor-pointer">
              <div onClick={() => handleMainTabSelect(files[index])}>
                <Image
                  src={file.src.trim() ?? null}
                  alt="image"
                  width={300}
                  height={300}
                  className="object-cover rounded-md lg:rounded-xl aspect-square"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="mt-5">
          <form action="" onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center gap-3">
              {/* <div
                                ref={ref as RefObject<HTMLDivElement>}
                                contentEditable={true}
                                id="message-input"
                                className="bg-gray-100 rounded-md flex-1 outline-none p-4 font-semibold"
                            ></div> */}
              <button
                onClick={handleAttachmentUpload}
                className="h-12 px-8 text-white font-bold rounded-full flex items-center justify-center bg-primary-dark-pink cursor-pointer ml-auto"
              >
                Send
                <LucideChevronRight stroke="#fff" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const MainTabPreview = ({ mainTab }: { mainTab: File | null }) => {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (mainTab) {
      const previewUrl = URL.createObjectURL(mainTab);
      setPreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [mainTab]);

  if (!preview) return null;

  return mainTab?.type.includes("video") ? (
    <video
      src={preview}
      className="object-cover rounded-lg lg:rounded-2xl w-full aspect-video"
      controls
    />
  ) : (
    <Image
      src={preview}
      alt="image"
      width={1000}
      height={1000}
      style={{ aspectRatio: "1/1" }}
      className="object-cover rounded-lg lg:rounded-2xl w-full aspect-video"
    />
  );
};

export default MediaPreviewer;
