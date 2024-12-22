"use client"
import {useNewPostStore} from "@/contexts/new-post-context";
import {imageTypes, videoTypes} from "@/lib/filetypes";
import {X} from "lucide-react";
import Image from "next/image";
import React, {useCallback, useEffect} from "react";
import NewPostMediaAdd from "../sub_components/sub/new-post-media-add";
import toast from "react-hot-toast";
import {useUserAuthContext} from "@/lib/userUseContext";
import {POST_CONFIG} from "@/config/config";

function PostMediaPreview({
                              submitPost,
                              medias,
                          }: {
    submitPost: (files: File[] | null) => void,
    medias?: File[] | null
}) {
    const [media, setMedia] = React.useState<File[] | null>(null)
    const {user} = useUserAuthContext()
    useEffect(() => {
        if (medias) {
            setMedia(medias)
        }
    }, [medias])

    const handleFileSelect = (files: File[]) => {
        if (files) {
            const allFiles = Array.from(files);

            // Check model file limit
            if (media && user?.is_model && media.length + allFiles.length > POST_CONFIG.MODEL_POST_LIMIT) {
                toast.error(POST_CONFIG.MODEL_POST_LIMIT_ERROR_MSG);
            }
            // Check regular user file limit
            else if (media && !user?.is_model && media.length + allFiles.length > POST_CONFIG.USER_POST_LIMIT) {
                toast.error(POST_CONFIG.USER_POST_LIMIT_ERROR_MSG);
            } else {
                // If limits are not exceeded, update media
                setMedia([...allFiles, ...(media || [])]);
            }
        }
    }

    const removeThisMedia = (index: number) => {
        if (media) {
            const files = media.filter((_, i) => i !== index)
            setMedia(files)
        }
    }

    useEffect(() => {
        submitPost(media)
    }, [media, submitPost])

    return (
        <>
            <div className="md:px-8 px-4 mb-5">
                <div
                    className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 items-center gap-3 overflow-x-auto select-none">
                    {media?.map((file, index) =>
                        <div className="relative" key={index}>
                            <Media file={file} index={index} removeThisMedia={removeThisMedia}/>
                        </div>
                    )}
                </div>
            </div>
            <NewPostMediaAdd handleFileSelect={handleFileSelect}/>
        </>
    );
}

const Media = ({file, removeThisMedia, index}: {
    file: File,
    index: number,
    removeThisMedia: (index: number) => void
}) => {
    const [url, setUrl] = React.useState<string | null>(null)
    useEffect(() => {
        if (imageTypes.includes(file.type)) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setUrl(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }

        if (videoTypes.includes(file.type)) {
            const blob = new Blob([file], {type: file.type})
            const url = URL.createObjectURL(blob)
            setUrl(url)
        }
    }, [file, setUrl])
    return (
        <>
            {file.type.includes("video") && (
                <video src={url || "/site/loading.gif"}
                       className="object-cover h-auto aspect-square shadow-lg border block rounded-xl"/>
            )}
            {file.type.includes("image") && (
                <Image src={url || "/site/loading.gif"}
                       alt="1" width={200} height={200}
                       className="object-cover h-auto aspect-square shadow-lg border block rounded-xl"/>
            )}
            <div
                className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1 w-full h-full rounded-xl flex items-center justify-center">
                <span onClick={() => removeThisMedia(index)} className="cursor-pointer">
                    <X size={20}/>
                </span>
            </div>
        </>
    )
}
export default PostMediaPreview;
