"use client";
import axios from "axios";
import {
    LucideArrowRight,
    LucideImage,
    LucideImages,
    LucidePlay,
    X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "@/contexts/UserUseContext";
import HlsViewer from "@/features/media/HlsViewer";
import StatusMediaPanel from "@/features/story/comps/StatusMediaPanel";
import type { SelectMoreProps } from "@/types/Components";
import { type StoryType, useStoryStore } from "../../../contexts/StoryContext";
import axiosServer from "@/utils/Axios";
import imageCompression from "browser-image-compression";
const StoryCaptionComponent = dynamic(() => import("./StoryCaptionComponent"), {
    ssr: false,
});
const StoryUploadForm = dynamic(() => import("./StoryUploadForm"), {
    ssr: false,
});
import { cn } from "@/components/ui/cn";

interface PresignedUrlResponse {
    media_id: string;
    presignedUrl: string;
    key: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    isVideo: boolean;
}

// Dynamically import HLSVideoPlayer to reduce initial load bundle
const HLSVideoPlayer = dynamic(() => import("../../media/videoplayer"), {
    ssr: false,
});

function StatusComponent() {
    const [openMore, setOpenMore] = useState(true);
    const [openStoryCaption, setStoryCaption] = useState(false);
    const [canContinue, setCanContinue] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const toastId = useMemo(() => "story-upload-toast", []);
    const {
        story: media,
        removeFromStory,
        updateStoryState,
        updateUploadProgress,
        updateStorySlide,
    } = useStoryStore();
    const { user } = useAuthContext();
    const toggleOpenMore = useCallback(() => {
        setOpenMore((prev) => !prev);
    }, []);

    const closeStoryComponent = useCallback(() => {
        setStoryCaption(false);
    }, []);

    useEffect(() => {
        if (
            media.length > 0 &&
            media.some(
                (m) =>
                    m.media_state !== "processing" &&
                    m.media_state !== "uploading" &&
                    m.media_state !== "pending",
            )
        ) {
            setCanContinue(true);
        } else {
            setCanContinue(false);
        }
    }, [media]);

    useEffect(() => {
        if (!user?.id) return;
        const evtSource = new EventSource(
            process.env.NEXT_PUBLIC_TS_EXPRESS_URL +
                `/events/story-media-state?userId=${user?.id}`,
        );
        evtSource.addEventListener(
            "story-processing-complete",
            (event: MessageEvent) => {
                console.log("SSE message received:", event.data);
                if (event.data) {
                    const data = JSON.parse(event.data);
                    updateStoryState(data.mediaId, "completed");
                }
            },
        );
        evtSource.onerror = (err) => {
            console.error("SSE error:", err);
        };

        return () => evtSource.close();
    }, [user?.id, updateStoryState]);

    // S3 upload functions
    const getPresignedUrls = async (
        files: File[],
        mediaIds: string[],
    ): Promise<PresignedUrlResponse[]> => {
        const fileData = files.map((file, index) => ({
            name: file.name,
            type: file.type,
            size: file.size,
            media_id: mediaIds[index],
        }));

        const response = await axiosServer.post("/stories/presigned-urls", {
            files: fileData,
        });

        return response.data.data;
    };

    const compressImage = async (file: File) => {
        const options = {
            maxSizeMB: 0.45,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            maxIteration: 10,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
        } catch (error) {
            console.log(error);
            return file;
        }
    };
    const uploadToS3 = async (
        file: File,
        presignedUrl: string,
        media_id: string,
    ): Promise<void> => {
        const compressedFile = await compressImage(file);
        await axios.put(presignedUrl, compressedFile, {
            headers: {
                "Content-Type": compressedFile.type,
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const progress =
                        (progressEvent.loaded / progressEvent.total) * 100;
                    updateUploadProgress(media_id, Math.round(progress));
                }
            },
        });
    };

    const completeUpload = async (
        uploadedFiles: Array<{
            media_id: string;
            key: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            isVideo: boolean;
        }>,
    ) => {
        const response = await axiosServer.post("/stories/complete-upload", {
            uploadedFiles,
        });

        return response.data.data;
    };

    // Upload pending files
    const uploadPendingFiles = async () => {
        const pendingFiles = media.filter(
            (item) => item.media_state === "pending" && item.file,
        );

        if (pendingFiles.length === 0) return;

        setIsUploading(true);

        try {
            // Step 1: Get presigned URLs
            const files = pendingFiles.map((item) => item.file!);
            const mediaIds = pendingFiles.map((item) => item.media_id);
            const presignedData = await getPresignedUrls(files, mediaIds);

            // Step 2: Mark files as uploading (media_ids should already match)
            pendingFiles.forEach((item) => {
                updateStorySlide(item.media_id, {
                    media_state: "uploading",
                });
            });

            // Step 3: Upload files to S3
            const uploadPromises = presignedData.map((data, index) =>
                uploadToS3(files[index], data.presignedUrl, data.media_id),
            );

            await Promise.all(uploadPromises);

            // Step 4: Complete upload and save to database
            toast.loading("Processing upload...", { id: toastId });

            const uploadedFiles = presignedData.map((data) => ({
                media_id: data.media_id,
                key: data.key,
                fileName: data.fileName,
                fileType: data.fileType,
                fileSize: data.fileSize,
                isVideo: data.isVideo,
            }));

            const completedFiles = await completeUpload(uploadedFiles);

            // Step 5: Update story items with final URLs and states
            completedFiles.forEach((item: any) => {
                const storyItem = media.find(
                    (m) => m.media_id === item.media_id,
                );
                if (storyItem) {
                    // Clean up blob URL
                    if (storyItem.media_url.startsWith("blob:")) {
                        URL.revokeObjectURL(storyItem.media_url);
                    }

                    // For images, mark as completed immediately. For videos, set to processing
                    const finalState = item.mimetype.startsWith("video/")
                        ? "processing"
                        : "completed";

                    updateStorySlide(storyItem.media_id, {
                        media_url: item.url,
                        media_state: finalState,
                        file: undefined, // Remove file reference
                        uploadProgress: undefined,
                    });
                }
            });
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Upload failed. Please try again.", { id: toastId });

            // Mark failed uploads
            pendingFiles.forEach((item) => {
                updateStoryState(item.media_id, "failed");
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Start upload when pending files are added
    useEffect(() => {
        const pendingFiles = media.filter(
            (item) => item.media_state === "pending",
        );
        if (pendingFiles.length > 0 && !isUploading) {
            uploadPendingFiles();
        }
    }, [media.length]);

    const handleSubmitStory = useCallback(() => {
        if (
            media.some(
                (m) =>
                    m.media_state === "processing" ||
                    m.media_state === "uploading" ||
                    m.media_state === "pending",
            )
        ) {
            toast.error(
                "Please wait for all media to finish processing before continuing.",
            );
            return;
        }
        if (media.length > 0) {
            setStoryCaption(true);
        }
    }, [media]);

    // Memoized removal handler creator to avoid inline functions in render
    const getRemoveHandler = useCallback(
        (id: number) => () => removeFromStory(id),
        [removeFromStory],
    );

    return (
        <>
            <div className="max-w-[550px] lg:mx-auto mx-2 sm:mx-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-100 dark:shadow-gray-900/20 overflow-hidden py-6 rounded-2xl lg:rounded-2xl sm:rounded-xl backdrop-blur-sm min-h-[70vh] sm:min-h-0 mb-24">
                {media.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 dark:text-gray-300">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-dark-pink/20 to-purple-500/20">
                            <LucideImages className="text-primary-dark-pink" />
                        </div>
                        <p className="font-medium text-gray-500 dark:text-gray-400">
                            No media selected
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Upload photos or videos to create your story
                        </p>
                    </div>
                ) : (
                    <div className="p-4 md:p-6">
                        <div className="grid grid-cols-3 gap-4 mb-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                            {media.map((data: StoryType) => (
                                <div key={data.id} className="group">
                                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 w-full aspect-square rounded-xl flex items-center justify-center relative ring-2 ring-transparent group-hover:ring-primary-dark-pink/30 transition-all duration-300 transform group-hover:scale-[1.02] shadow-md hover:shadow-lg overflow-hidden">
                                        <button
                                            onClick={getRemoveHandler(data.id)}
                                            className="absolute cursor-pointer z-50 top-2 right-2 bg-red-500 hover:bg-red-600 p-1.5 rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all duration-200 transform scale-90 hover:scale-100"
                                        >
                                            <X
                                                strokeWidth={2.5}
                                                stroke="#fff"
                                                size={14}
                                            />
                                        </button>
                                        {data.media_type === "video" ? (
                                            <div className="relative w-full h-full">
                                                {data.media_state ===
                                                    "pending" ||
                                                data.media_state ===
                                                    "processing" ||
                                                data.media_state ===
                                                    "uploading" ? (
                                                    <video
                                                        src={data.media_url}
                                                        muted
                                                        className="inset-0 object-cover aspect-square w-full h-full cursor-pointer duration-300 ease-in-out rounded-xl"
                                                    />
                                                ) : (
                                                    <HlsViewer
                                                        key={`${data.id}-${data.media_state}`}
                                                        streamUrl={
                                                            data.media_url
                                                        }
                                                        muted={true}
                                                        className="inset-0 object-cover aspect-square w-full h-full cursor-pointer duration-300 ease-in-out rounded-xl"
                                                    />
                                                )}
                                                <span className="absolute top-2 left-2 bg-gradient-to-r from-primary-dark-pink to-purple-600 p-1.5 rounded-full shadow-lg backdrop-blur-sm z-10">
                                                    <LucidePlay
                                                        fill="#fff"
                                                        strokeWidth={0}
                                                        size={12}
                                                    />
                                                </span>

                                                {/* Uploading State Overlay */}
                                                {data.media_state ===
                                                    "uploading" && (
                                                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-xl">
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="relative">
                                                                {/* Background Circle */}
                                                                <svg className="w-16 h-16 transform -rotate-90">
                                                                    <circle
                                                                        cx="32"
                                                                        cy="32"
                                                                        r="28"
                                                                        stroke="currentColor"
                                                                        strokeWidth="3"
                                                                        fill="none"
                                                                        className="text-white/20"
                                                                    />
                                                                    <circle
                                                                        cx="32"
                                                                        cy="32"
                                                                        r="28"
                                                                        stroke="currentColor"
                                                                        strokeWidth="3"
                                                                        fill="none"
                                                                        strokeDasharray={`${2 * Math.PI * 28}`}
                                                                        strokeDashoffset={`${
                                                                            2 *
                                                                            Math.PI *
                                                                            28 *
                                                                            (1 -
                                                                                (data.uploadProgress ||
                                                                                    0) /
                                                                                    100)
                                                                        }`}
                                                                        className="text-purple-400 transition-all duration-300 ease-out"
                                                                        strokeLinecap="round"
                                                                    />
                                                                </svg>
                                                                {/* Centered Progress Text */}
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <span className="text-lg font-bold text-white drop-shadow-lg">
                                                                        {Math.round(
                                                                            data.uploadProgress ||
                                                                                0,
                                                                        )}
                                                                        %
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Processing State Overlay */}
                                                {data.media_state ===
                                                    "processing" && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/90 to-amber-600/90 backdrop-blur-sm rounded-xl">
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="relative">
                                                                {/* Spinning Ring */}
                                                                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                                                {/* Inner Pulse */}
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="w-8 h-8 bg-white/40 rounded-full animate-pulse" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Animated Dots Indicator */}
                                                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Completed State Overlay */}
                                                {data.media_state ===
                                                    "completed" && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-[1px] rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="absolute top-3 right-3">
                                                            {/* Checkmark SVG */}
                                                            <svg
                                                                className="w-6 h-6 text-white drop-shadow-lg"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        3
                                                                    }
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Failed State Overlay */}
                                                {data.media_state ===
                                                    "failed" && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/90 to-red-600/90 backdrop-blur-sm rounded-xl">
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="text-center text-white">
                                                                <X className="w-12 h-12 mx-auto mb-2 stroke-[3]" />
                                                                <p className="text-sm font-semibold">
                                                                    Failed
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={data.media_url}
                                                    alt="media"
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, 640px"
                                                    className="object-cover cursor-pointer duration-300 ease-in-out rounded-xl group-hover:brightness-110"
                                                />

                                                {/* Uploading State Overlay */}
                                                {data.media_state ===
                                                    "uploading" && (
                                                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-xl">
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="relative">
                                                                {/* Background Circle */}
                                                                <svg className="w-16 h-16 transform -rotate-90">
                                                                    <circle
                                                                        cx="32"
                                                                        cy="32"
                                                                        r="28"
                                                                        stroke="currentColor"
                                                                        strokeWidth="3"
                                                                        fill="none"
                                                                        className="text-white/20"
                                                                    />
                                                                    <circle
                                                                        cx="32"
                                                                        cy="32"
                                                                        r="28"
                                                                        stroke="currentColor"
                                                                        strokeWidth="3"
                                                                        fill="none"
                                                                        strokeDasharray={`${2 * Math.PI * 28}`}
                                                                        strokeDashoffset={`${
                                                                            2 *
                                                                            Math.PI *
                                                                            28 *
                                                                            (1 -
                                                                                (data.uploadProgress ||
                                                                                    0) /
                                                                                    100)
                                                                        }`}
                                                                        className="text-purple-400 transition-all duration-300 ease-out"
                                                                        strokeLinecap="round"
                                                                    />
                                                                </svg>
                                                                {/* Centered Progress Text */}
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <span className="text-lg font-bold text-white drop-shadow-lg">
                                                                        {Math.round(
                                                                            data.uploadProgress ||
                                                                                0,
                                                                        )}
                                                                        %
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Completed State Overlay */}
                                                {data.media_state ===
                                                    "completed" && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-[1px] rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="absolute top-3 right-3">
                                                            {/* Checkmark SVG */}
                                                            <svg
                                                                className="w-6 h-6 text-white drop-shadow-lg"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        3
                                                                    }
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Failed State Overlay */}
                                                {data.media_state ===
                                                    "failed" && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/90 to-red-600/90 backdrop-blur-sm rounded-xl">
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="text-center text-white">
                                                                <X className="w-12 h-12 mx-auto mb-2 stroke-[3]" />
                                                                <p className="text-sm font-semibold">
                                                                    Failed
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <button
                                disabled={!canContinue}
                                type="button"
                                aria-label="Continue to add caption and share story"
                                title="Continue to add caption and share story"
                                onClick={handleSubmitStory}
                                className="flex items-center disabled:from-black/40 disabled:to-gray-500 justify-center px-6 py-3 font-medium text-white rounded-full shadow-lg gap-3 transition-all duration-200 transform group bg-gradient-to-r from-primary-dark-pink to-purple-600 hover:from-primary-dark-pink/90 hover:to-purple-600/90 hover:shadow-xl hover:scale-105"
                            >
                                <span className="hidden text-sm sm:block">
                                    Continue
                                </span>
                                <LucideArrowRight
                                    size={18}
                                    strokeWidth={2.5}
                                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                                />
                            </button>
                        </div>
                    </div>
                )}
                <SelectMoreItems
                    openMore={openMore}
                    handleOpenMore={toggleOpenMore}
                />
            </div>
            {openStoryCaption && (
                <StoryCaptionComponent close={closeStoryComponent} />
            )}
        </>
    );
}

const SelectMoreItems = React.memo(
    ({ openMore, handleOpenMore }: SelectMoreProps) => {
        const [activeTab, setActiveTab] = useState<"new" | "media">("new");
        const handleSetTab = useCallback((tab: "new" | "media") => {
            setActiveTab(tab);
        }, []);

        return (
            <div className="border-t border-gray-200 dark:border-gray-700 max-w-[550px] lg:mx-auto relative bottom-0 left-0 z-20 bg-white dark:bg-gray-800 w-full transition-all duration-300 ease-in-out rounded-b-2xl lg:rounded-b-2xl sm:rounded-b-xl">
                <div className="flex flex-col h-[70vh] relative dark:text-white">
                    <div className="sticky top-0 z-10 flex  items-center p-1 m-2 text-center rounded-t-lg bg-gray-50 dark:bg-gray-900/50">
                        <button
                            onClick={() => handleSetTab("new")}
                            className={cn(
                                "flex-1 cursor-pointer duration-300 transition-all rounded-md",
                                activeTab === "new"
                                    ? "bg-white dark:bg-gray-800 text-primary-dark-pink shadow-sm font-semibold"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200",
                            )}
                        >
                            <span className="block px-4 py-3 text-xs font-medium sm:text-sm">
                                New Upload
                            </span>
                        </button>
                        <button
                            onClick={() => handleSetTab("media")}
                            className={cn(
                                "flex-1 cursor-pointer duration-300 transition-all rounded-md",
                                activeTab === "media"
                                    ? "bg-white dark:bg-gray-800 text-primary-dark-pink shadow-sm font-semibold"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200",
                            )}
                        >
                            <span className="block px-4 py-3 text-xs font-medium sm:text-sm">
                                My Media
                            </span>
                        </button>
                    </div>
                    <div className="h-full p-2 overflow-hidden">
                        {activeTab === "new" && <StoryUploadForm />}
                        {activeTab === "media" && <StatusMediaPanel />}
                    </div>
                </div>
            </div>
        );
    },
);

SelectMoreItems.displayName = "SelectMoreItems";

export default React.memo(StatusComponent);
