"use client";
import { useCallback, useRef, useState } from "react";
import { X, ChevronRight } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useMediaContext } from '@/contexts/message-media-context';
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

const UploadMediaModal: React.FC = () => {
  const {
    mediaFiles,
    isModalOpen,
    addFiles,
    removeFile,
    closeModal
  } = useMediaContext();
  
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const swiperRef = useRef(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const imageTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/svg+xml",
        "image/webp",
        "image/bmp",
        "image/tiff",
        "image/ico",
      ];
      const videoTypes = ["video/mp4", "video/webm", "video/ogg"];

      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(
          (file) =>
            imageTypes.includes(file.type) || videoTypes.includes(file.type)
        );

        if (validFiles.length !== selectedFiles.length) {
          toast.error(
            "Invalid file type, please select an image or video file"
          );
          return;
        }

        addFiles(e.target.files);
      }
    },
    [addFiles]
  );

  if (!isModalOpen) return null;

  // Show the file selector if no files have been selected
  if (mediaFiles.length === 0) {
    return (
      <div className="fixed bg-white inset-0 w-full min-h-screen z-[100]">
        <div className="flex items-center justify-center h-full w-full p-2 relative">
          <div
            className="absolute top-[3%] rounded-full bg-white p-3 shadow-lg cursor-pointer"
            onClick={closeModal}
          >
            <X size={30} stroke="#000" className="p-0 m-0" />
          </div>
          
          <input
            ref={inputRef}
            onChange={handleFileSelect}
            type="file"
            id="fileUpload"
            name="fileUpload"
            className="hidden"
            multiple
          />
          
          <label
            htmlFor="fileUpload"
            className="flex flex-col items-center p-6 border rounded-lg md:w-2/5 w-4/5 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 mb-5 rounded-full">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
            </div>
            <p className="mt-2 font-medium text-gray-900">
              Drag and drop your media here
            </p>
            <p className="mt-2 text-sm text-gray-500 mb-5">or</p>
            <p className="mt-2 px-5 py-3 font-bold bg-primary-dark-pink text-white bg rounded-md">
              Select Media
            </p>
          </label>
        </div>
      </div>
    );
  }

  // Show media preview if files have been selected
  return (
    <div className="fixed bg-white inset-0 w-full min-h-screen">
      <div className="flex items-center justify-center h-full w-full p-2 relative">
        <div
          className="absolute top-[3%] rounded-full bg-white p-3 shadow-lg cursor-pointer"
          onClick={closeModal}
        >
          <X size={30} stroke="#000" className="p-0 m-0" />
        </div>
        
        <div className="border rounded-2xl p-2 md:p-8 py-4 w-full sm:w-5/6 md:w-4/6 lg:w-4/6 xl:w-1/3">
          {/* Main preview */}
          <div className="flex justify-center mb-5">
            {mediaFiles[activeFileIndex] && (
              mediaFiles[activeFileIndex].type === "video" ? (
                <video
                  src={mediaFiles[activeFileIndex].previewUrl}
                  className="object-cover rounded-lg lg:rounded-2xl w-full aspect-video"
                  controls
                />
              ) : (
                <Image
                  src={mediaFiles[activeFileIndex].previewUrl}
                  alt="image"
                  width={1000}
                  height={1000}
                  style={{ aspectRatio: "1/1" }}
                  className="object-cover rounded-lg lg:rounded-2xl w-full aspect-video"
                />
              )
            )}
          </div>
          
          {/* Thumbnails */}
          {mediaFiles.length > 1 && (
            <Swiper
              ref={swiperRef}
              slidesPerView={5}
              spaceBetween={10}
              modules={[Navigation]}
              pagination={{ clickable: true }}
              className="h-full w-full"
            >
              {mediaFiles.map((file, index) => (
                <SwiperSlide key={index} className="cursor-pointer">
                  <div 
                    onClick={() => setActiveFileIndex(index)}
                    className={`relative ${activeFileIndex === index ? 'ring-2 ring-primary-dark-pink' : ''}`}
                  >
                    <Image
                      src={file.posterUrl || file.previewUrl}
                      alt="image"
                      width={300}
                      height={300}
                      className="object-cover rounded-md lg:rounded-xl aspect-square"
                    />
                    {/* Delete button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                        // Update active index if needed
                        if (index === activeFileIndex) {
                          setActiveFileIndex(Math.max(0, index - 1));
                        } else if (index < activeFileIndex) {
                          setActiveFileIndex(activeFileIndex - 1);
                        }
                      }}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                    >
                      <X size={14} stroke="#fff" />
                    </button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          
          {/* Controls */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.click();
                }
              }}
              className="px-4 py-2 border border-primary-dark-pink text-primary-dark-pink font-bold rounded-full flex items-center"
            >
              Add More
            </button>
            
            <input
              ref={inputRef}
              onChange={handleFileSelect}
              type="file"
              className="hidden"
              multiple
            />
            
            <button
              onClick={closeModal}
              className="h-12 px-8 text-white font-bold rounded-full flex items-center justify-center bg-primary-dark-pink cursor-pointer ml-auto"
            >
              Confirm
              <ChevronRight stroke="#fff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadMediaModal;
