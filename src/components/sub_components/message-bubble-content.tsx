import React, { useCallback, useEffect, useRef, useState } from "react";
import path from "path";
import {
    Attachment,
    MediaFile,
    MessageBubbleContentProps,
    UploadResponseResponse,
} from "@/types/components";
import { useUserAuthContext } from "@/lib/userUseContext";
import usePostComponent from "@/contexts/post-component-preview";
import HLSVideoPlayer from "../sub_components/videoplayer";
import Image from "next/image";
import { HiPlay } from "react-icons/hi";
import { LucideImage, LucideLoader, LucideVideo } from "lucide-react";
import UploadImageToCloudflare from "@/utils/cloudflare-image-uploader";
import { getMaxDurationBase64 } from "@/utils/get-video-max-duration";
import axios from "axios";
import { getToken } from "@/utils/cookie.get";
import UploadWithTus from "@/utils/tusUploader";
import ProgressCircle from "./file-upload-progress";
import VideoPlayer from "../sub_components/videoplayer";
import { useMediaContext } from "@/contexts/message-media-context";

const MessageBubbleContent: React.FC<MessageBubbleContentProps> = ({
    message,
    hasAttachments,
    hasMessage,
    hasRawFiles,
    SendSocketMessage,
    attachment = [],
    rawFiles = [],
    isSender,
}) => {
    const { fullScreenPreview } = usePostComponent();
    const { user } = useUserAuthContext();
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [uploadError, setUploadError] = useState<Record<string, boolean>>({});
    const { resetAll } =
        useMediaContext();

    const removePreloader = (id: string) => {
        document.getElementById(id)?.remove();
    };

    // Media preview handlers
    const handlePreview = useCallback(
        (file: Attachment, index: number) => {
            fullScreenPreview({
                url: file.url,
                type: file.type.includes("image") ? "image" : "video",
                open: true,
                ref: index,
                otherUrl:
                    (attachment &&
                        attachment.map((f) => ({ url: f.url, type: f.type }))) ||
                    [],
                withOptions: true,
            });
        },
        [attachment, fullScreenPreview]
    );
    const handleRawPreview = useCallback(
        (file: MediaFile, index: number) => {
            fullScreenPreview({
                url: file.previewUrl,
                type: file.type.includes("image") ? "image" : "video",
                open: true,
                ref: index,
                otherUrl: rawFiles.map((f) => ({ url: f.previewUrl, type: f.type })),
                withOptions: true,
            });
        },
        [rawFiles, fullScreenPreview]
    );

    // Get signed upload URL (image/video)
    const token = getToken();
    const getUploadUrl = useCallback(
        async (file: File): Promise<UploadResponseResponse> => {
            if (!file) throw new Error("File is not defined");
            const isVideo = file.type.startsWith("video/");
            const maxVideoDuration = isVideo ? getMaxDurationBase64(file) : null;
            const payload: any = {
                type: isVideo ? "video" : "image",
                fileName: btoa(`paymefans-attachment-${user?.username}-${Date.now()}`),
                fileSize: file.size,
                fileType: btoa(file.type),
                explicitImageType: file.type,
            };
            if (isVideo && maxVideoDuration) payload.maxDuration = maxVideoDuration;

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/media/signed-url`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.data.error) throw new Error(response.data.message);
            return response.data as UploadResponseResponse;
        },
        [token, user]
    );

    // Upload all raw files and send via socket when done
    useEffect(() => {
        if (!rawFiles.length) return;

        async function uploadFilesAndSend() {
            const files: (Attachment | null)[] = [];

            for (const item of rawFiles) {
                try {
                    const upload = await getUploadUrl(item.file);
                    if (item.type === "image" && upload.type.includes("image")) {
                        const imgRes = await UploadImageToCloudflare({
                            file: item.file,
                            id: item.previewUrl,
                            uploadUrl: upload.uploadUrl,
                            setProgress,
                            setUploadError,
                        });
                        files.push({
                            url: imgRes.result?.variants.find((v: string) =>
                                v.includes("/public")
                            ),
                            name: imgRes.result?.id,
                            type: "image",
                            extension: path.extname(item.file.name),
                            size: item.file.size,
                        });
                    } else if (item.type === "video" && upload.type.includes("video")) {
                        const mediaId = await UploadWithTus(
                            item.file,
                            upload.uploadUrl,
                            item.previewUrl,
                            setProgress,
                            setUploadError
                        );
                        files.push({
                            url: `${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN}${mediaId}/manifest/video.m3u8`,
                            type: "video",
                            name: mediaId,
                            extension: path.extname(item.file.name),
                            size: item.file.size,
                        });
                    } else {
                        files.push(null);
                    }
                } catch (err) {
                    files.push(null);
                }
            }

            const uploadedFiles = files.filter(Boolean) as Attachment[];
            SendSocketMessage(uploadedFiles);
        }

        uploadFilesAndSend();
        // eslint-disable-next-line
    }, [rawFiles, SendSocketMessage, getUploadUrl]);

    return (
        <>
            {hasAttachments && attachment?.length && (
                <div
                    className={`grid overflow-hidden ${attachment.length >= 4 ? "grid-cols-2" : "grid-cols-1"
                        }`}
                >
                    {attachment.map((file: Attachment, idx: number) => (
                        <div
                            key={file.url || idx}
                            className="p-2 cursor-pointer relative group transition-transform duration-200 hover:scale-105"
                            tabIndex={0}
                            aria-label={
                                file.type.includes("image") ? "Image preview" : "Video preview"
                            }
                            role="button"
                        >
                            {file.type.includes("image") ? (
                                <div className="relative">
                                    <div
                                        className="absolute inset-0 flex items-center justify-center dark:bg-slate-950 bg-gray-100 z-10 w-full h-full rounded-lg"
                                        style={{ minWidth: 0, minHeight: 0 }}
                                        id={`image-preloader-${file.name}`}
                                    >
                                        <LucideLoader
                                            className="animate-spin text-primary-dark-pink"
                                            size={20}
                                        />
                                    </div>
                                    <Image
                                        priority
                                        width={300}
                                        height={300}
                                        onClick={() => handlePreview(file, idx)}
                                        quality={80}
                                        src={file.url}
                                        alt="Uploaded content"
                                        className="w-full object-cover rounded-lg aspect-square group-hover:brightness-90 transition"
                                        onLoad={() =>
                                            removePreloader(`image-preloader-${file.name}`)
                                        }
                                    />
                                    <span
                                        className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
                                        <LucideImage className="text-white" size={16} />
                                    </span>
                                </div>
                            ) : (
                                <div
                                    className="relative"
                                    onClick={() => handlePreview(file, idx)}
                                >
                                    <HLSVideoPlayer
                                        streamUrl={file.url}
                                        autoPlay={false}
                                        modalOpen={false}
                                        allOthers={{
                                            controls: false,
                                            playsInline: true,
                                            id: "video_player_full",
                                            muted: false,
                                        }}
                                        className="object-cover w-full aspect-square"
                                    />
                                    <div
                                        className="bg-black/40 absolute inset-0 w-full h-full flex items-center justify-center group-hover:bg-black/60 transition">
                                        <button
                                            className="h-12 w-12 p-1 rounded-full flex items-center justify-center bg-primary-dark-pink/90 aspect-square shadow-lg hover:bg-primary-dark-pink transition"
                                            tabIndex={-1}
                                            aria-label="Play video"
                                        >
                                            <HiPlay className="text-white" size={40} />
                                        </button>
                                    </div>
                                    <span
                                        className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
                                        <LucideVideo className="text-white" size={16} />
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {hasRawFiles && (
                <div
                    className={`grid overflow-hidden ${rawFiles.length >= 4 ? "grid-cols-2" : "grid-cols-1"
                        }`}
                >
                    {rawFiles.map((file: MediaFile, idx: number) => (
                        <div
                            key={file.previewUrl || idx}
                            className="p-2 cursor-pointer relative group transition-transform duration-200 hover:scale-105"
                            onClick={() => handleRawPreview(file, idx)}
                            tabIndex={0}
                            aria-label={
                                file.type.includes("image")
                                    ? "Image upload preview"
                                    : "Video upload preview"
                            }
                            role="button"
                        >
                            {file.type.includes("image") ? (
                                <div className="relative">
                                    <Image
                                        priority
                                        width={300}
                                        height={300}
                                        quality={80}
                                        src={file.previewUrl}
                                        alt="Uploading image"
                                        className="w-full object-cover rounded-lg aspect-square shadow-md group-hover:brightness-90 transition"
                                    />
                                    <span
                                        className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
                                        <LucideImage className="text-white" size={16} />
                                    </span>
                                </div>
                            ) : (
                                <div className="relative">
                                    <VideoPlayer
                                        allOthers={{
                                            muted: true,
                                            playsInline: true,
                                            preload: "metadata",
                                            "aria-label": "Video uploading",
                                        }}
                                        streamUrl={file.previewUrl}
                                        autoPlay={false}
                                        className="w-full object-cover rounded-lg shadow-md group-hover:brightness-75 transition"
                                        modalOpen={false}
                                    />
                                    <div
                                        className="bg-black/40 absolute inset-0 w-full h-full flex items-center justify-center group-hover:bg-black/60 transition">
                                        <button
                                            className="h-12 w-12 p-1 rounded-full flex items-center justify-center bg-primary-dark-pink/90 aspect-square shadow-lg hover:bg-primary-dark-pink transition"
                                            tabIndex={-1}
                                            aria-label="Play video"
                                        >
                                            <HiPlay className="text-white" size={40} />
                                        </button>
                                    </div>
                                    <span
                                        className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
                                        <LucideVideo className="text-white" size={16} />
                                    </span>
                                </div>
                            )}
                            {progress[file.previewUrl] > 0 && (
                                <div className="absolute top-3 right-3 flex items-center justify-center w-12 h-12 z-10">
                                    <ProgressCircle
                                        progress={progress[file.previewUrl] || 0}
                                        size={20}
                                    />
                                    <span className="absolute text-[10px] text-white font-semibold drop-shadow">
                                        {progress[file.previewUrl] < 100
                                            ? `${progress[file.previewUrl]}%`
                                            : ""}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {hasMessage && (
                <div
                    className={`p-4 rounded-3xl font-medium ${isSender
                        ? "bg-gray-100 rounded-br-none"
                        : "bg-primary-dark-pink text-white rounded-bl-none"
                        }`}
                >
                    <div
                        className={`leading-relaxed w-full text-wrap ${isSender ? "sender-link-style" : "receiver-link-style"
                            }`}
                        dangerouslySetInnerHTML={{
                            __html: message as TrustedHTML,
                        }}
                    />
                </div>
            )}
        </>
    );
};

export default MessageBubbleContent;
