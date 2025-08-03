import { useEffect, useState } from "react";
import { HiCamera } from "react-icons/hi";
import axiosServer from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useStoryStore } from "@/contexts/StoryContext";

const StoryUploadForm = () => {
  const [selected, setSelected] = useState<File[]>([]);
  const { addToStory } = useStoryStore();
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileArrays = Array.from(e.target.files || []);
    setSelected(fileArrays);
  };
  const token = getToken();

  useEffect(() => {
    const UploadImagesAndAddToStory = async () => {
      const formData = new FormData();
      selected.forEach((file) => {
        formData.append("files[]", file);
      });
      try {
        toast
          .promise(
            axiosServer.post("/stories/upload", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }),
            {
              loading: "Uploading Media...",
              success: "Media uploaded successfully",
              error: (err: AxiosError) => {
                console.error("Error while uploading images", err);
                return "Error while uploading images";
              },
            },
          )
          .then(({ data }) => {
            data.data.map((item: any, index: number) => {
              addToStory({
                index,
                id: Math.random() * 1000,
                media_url: item.filename,
                media_type: item.mimetype.split("/")[0],
              });
            });
          });
      } catch (err: unknown) {
        console.error("Error while uploading images", err);
      }
    };
    if (selected.length > 0) {
      UploadImagesAndAddToStory();
    }
  }, [selected, token, addToStory]);

  return (
    <form className="flex-1 h-full">
      <label
        htmlFor="file"
        className="group cursor-pointer w-full h-full flex flex-1 gap-6 sm:gap-4 flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-primary-dark-pink/5 hover:to-purple-500/5 dark:hover:from-primary-dark-pink/10 dark:hover:to-purple-500/10 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-dark-pink/50 dark:hover:border-primary-dark-pink/50 rounded-lg sm:rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.01] p-8 sm:p-8 py-12"
      >
        <div className="flex items-center justify-center w-20 h-20 rounded-full shadow-lg sm:w-16 sm:h-16 bg-gradient-to-br from-primary-dark-pink/20 to-purple-500/20 group-hover:from-primary-dark-pink/30 group-hover:to-purple-500/30 transition-all duration-300">
          <HiCamera
            size={40}
            className="text-primary-dark-pink group-hover:scale-110 transition-transform duration-300 sm:w-8 sm:h-8"
          />
        </div>
        <div className="text-center space-y-3 sm:space-y-2">
          <span className="block text-xl font-semibold text-gray-700 sm:text-lg dark:text-gray-200 group-hover:text-primary-dark-pink dark:group-hover:text-primary-dark-pink transition-colors duration-300">
            Select photos or videos
          </span>
          <span className="block text-base text-gray-500 sm:text-sm dark:text-gray-400">
            Drag and drop or click to browse
          </span>
          <span className="block px-4 text-sm text-gray-400 sm:text-xs dark:text-gray-500">
            Supports JPG, PNG, MP4, MOV
          </span>
        </div>
        <div className="px-8 py-3 text-base font-medium text-gray-600 bg-white border border-gray-200 rounded-full sm:px-6 sm:py-2 dark:bg-gray-800 dark:border-gray-600 sm:text-sm dark:text-gray-300 group-hover:bg-primary-dark-pink group-hover:text-white group-hover:border-primary-dark-pink transition-all duration-300 shadow-sm">
          Choose Files
        </div>
        <input
          type="file"
          multiple
          id="file"
          accept="image/*,video/*"
          onChange={handleSelect}
          className="hidden"
        />
      </label>
    </form>
  );
};

export default StoryUploadForm;
