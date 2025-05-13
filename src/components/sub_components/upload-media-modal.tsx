"use client";
import { useCallback, useRef, useState } from "react";
import { X, ChevronRight } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useMediaContext } from "@/contexts/message-media-context";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

const UploadMediaModal: React.FC = () => {
  const { mediaFiles, isModalOpen, addFiles, removeFile, closeModal } =
    useMediaContext();

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
      // const videoTypes = ["video/mp4", "video/webm", "video/ogg"];

      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(
          (file) =>
            imageTypes.includes(file.type) || file.type.startsWith("video/")
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
      <div className="fixed bg-white dark:bg-gray-900 inset-0 w-full min-h-dvh z-[100] transition-colors">
        <div className="flex items-center justify-center h-full w-full p-2 relative">
          {/* Close button */}
          <div
            className="absolute top-[3%] left-[3%] rounded-full bg-white dark:bg-gray-800 p-3 shadow-lg cursor-pointer transition-colors"
            onClick={closeModal}
          >
            <X size={30} stroke="#000" className="p-0 m-0 dark:stroke-white" />
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
            className="flex flex-col items-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl md:w-2/5 w-4/5 cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 mb-6 rounded-full transition-colors">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-300"
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
            <p className="mt-2 font-medium text-gray-900 dark:text-gray-100 text-lg">
              Drag and drop your media here
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-5">
              or
            </p>
            <p className="mt-2 px-6 py-3 font-bold bg-primary-dark-pink text-white rounded-md shadow hover:bg-primary-dark-pink/90 transition-colors">
              Select Media
            </p>
          </label>
        </div>
      </div>
    );
  }

  // Show media preview if files have been selected
  return (
    <div className="fixed bg-white dark:bg-gray-900 inset-0 w-full min-h-dvh z-[100] transition-colors">
      <div className="flex items-center justify-center h-full w-full p-2 relative">
        {/* Close button */}
        <div
          className="absolute top-[3%] left-[3%] rounded-full bg-white dark:bg-gray-800 p-3 shadow-lg cursor-pointer transition-colors"
          onClick={closeModal}
        >
          <X size={30} stroke="#000" className="p-0 m-0 dark:stroke-white" />
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-2 md:p-8 py-4 w-full sm:w-5/6 md:w-4/6 lg:w-4/6 xl:w-1/3 bg-white dark:bg-gray-900 shadow-xl transition-colors">
          {/* Main preview */}
          <div className="flex justify-center mb-5">
            {mediaFiles[activeFileIndex] &&
              (mediaFiles[activeFileIndex].type === "video" ? (
                <video
                  src={mediaFiles[activeFileIndex].previewUrl}
                  className="object-cover rounded-lg lg:rounded-2xl w-full aspect-video bg-gray-100 dark:bg-gray-800 transition-colors"
                  controls
                />
              ) : (
                <Image
                  src={mediaFiles[activeFileIndex].previewUrl}
                  alt="image"
                  width={1000}
                  height={1000}
                  style={{ aspectRatio: "1/1" }}
                  className="object-cover rounded-lg lg:rounded-2xl w-full aspect-video bg-gray-100 dark:bg-gray-800 transition-colors"
                />
              ))}
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
                    className={`relative transition-all ${
                      activeFileIndex === index
                        ? "ring-2 ring-primary-dark-pink"
                        : "ring-1 ring-gray-200 dark:ring-gray-700"
                    } bg-gray-50 dark:bg-gray-800`}
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
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 transition-colors rounded-full p-1 shadow"
                      aria-label="Remove media"
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
              className="px-4 py-2 border border-primary-dark-pink text-primary-dark-pink dark:border-pink-400 dark:text-pink-400 font-bold rounded-full flex items-center hover:bg-primary-dark-pink/10 dark:hover:bg-pink-400/10 transition-colors"
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
              className="h-12 px-8 text-white font-bold rounded-full flex items-center justify-center bg-primary-dark-pink dark:bg-pink-500 hover:bg-primary-dark-pink/90 dark:hover:bg-pink-400 transition-colors cursor-pointer ml-auto"
            >
              Confirm
              <ChevronRight stroke="#fff" className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadMediaModal;
