import { useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useStoryStore } from "@/contexts/StoryContext";
import toast from "react-hot-toast";
import { videoTypes } from "@/lib/FileTypes";
import { LucidePlus } from "lucide-react";

const StoryUploadForm = () => {
    const { addToStory } = useStoryStore();

    const handleSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);

            if (files.length > 0) {
                (async () => {
                    let index = 0;
                    for (const file of files) {
                        const media_id = uuid();
                        const options = {
                            maxSizeMB: 1,
                            maxWidthOrHeight: 1080,
                            useWebWorker: true,
                            fileType: "image/jpeg",
                        };

                        const fileUrl = URL.createObjectURL(file);

                        const isVideo = file.type.startsWith("video/");
                        if (
                            !videoTypes.includes(file.type) &&
                            !isVideo &&
                            file.size > 10 * 1024 * 1024
                        ) {
                            toast.error("Image size should be less than 10MB", {
                                id: "file-too-large",
                            });
                            index++;
                            continue;
                        }

                        if (isVideo && file.size > 5 * 1024 * 1024 * 1024) {
                            toast.error("Video size should be less than 5GB", {
                                id: "file-too-large",
                            });
                            index++;
                            continue;
                        }

                        // Add media_id to file object for server sync
                        (file as any).media_id = media_id;

                        addToStory({
                            id: Date.now() + index,
                            index,
                            media_id,
                            media_type: isVideo ? "video" : "image",
                            media_state: "pending",
                            media_url: fileUrl,
                            uploadProgress: 0,
                            file,
                        });

                        index++;
                    }

                    // Clear the input
                    e.target.value = "";
                })();
            }
        },
        [addToStory],
    );

    return (
        <form className="flex-1 h-full">
            <label
                htmlFor="file"
                className="group cursor-pointer w-full h-full flex flex-1 gap-6 sm:gap-4 flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-primary-dark-pink/5 hover:to-purple-500/5 dark:hover:from-primary-dark-pink/10 dark:hover:to-purple-500/10 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-dark-pink/50 dark:hover:border-primary-dark-pink/50 rounded-lg sm:rounded-xl transition-all duration-300 ease-in-out transform p-8 sm:p-8 py-12"
            >
                <div className="flex items-center justify-center w-20 h-20 rounded-full shadow-lg sm:w-16 sm:h-16 bg-gradient-to-br from-primary-dark-pink/20 to-purple-500/20 group-hover:from-primary-dark-pink/30 group-hover:to-purple-500/30 transition-all duration-300">
                    <LucidePlus
                        size={40}
                        className="text-primary-dark-pink group-hover:scale-110 transition-transform duration-300 sm:w-8 sm:h-8"
                    />
                </div>

                <div className="text-center space-y-3 sm:space-y-2">
                    <span className="block text-base font-semibold text-gray-700 sm:text-lg dark:text-gray-200 group-hover:text-primary-dark-pink dark:group-hover:text-primary-dark-pink transition-colors duration-300">
                        Select photos or videos
                    </span>
                    <span className="block text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                        Drag and drop or click to browse
                    </span>
                    <span className="block px-4 text-gray-400 text-xs dark:text-gray-500">
                        Supports JPG, PNG, MP4, MOV
                    </span>
                </div>

                <div className="px-8 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full sm:px-6 sm:py-2 dark:bg-gray-800 dark:border-gray-600 sm:text-base dark:text-gray-300 group-hover:bg-primary-dark-pink group-hover:text-white group-hover:border-primary-dark-pink transition-all duration-300 shadow-sm">
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
