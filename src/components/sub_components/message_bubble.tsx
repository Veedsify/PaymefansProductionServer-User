"use client"
import { useUserAuthContext } from "@/lib/userUseContext";
import usePostComponent from "@/contexts/post-component-preview";
import { LucidePlay } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import path from "path";
import { HiPlay } from "react-icons/hi";
import { Attachment, MessageBubbleProps } from "@/types/components";


const server = process.env.NEXT_PUBLIC_EXPRESS_URL_DIRECT as string

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, seen, message, date, attachment }) => {
    const [attachmentFile, setAttachmentFile] = useState<Attachment[] | null>(null);
    const { user } = useUserAuthContext()
    const dateString = new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).toString();
    const { fullScreenPreview } = usePostComponent();
    const toggleLightBox = (file: Attachment, index: number) => {
        fullScreenPreview(
            {
                url: `${server}${file.url}`,
                type: file.type.includes("image") ? "image" : "video",
                open: true,
                ref: index,
                otherUrl: [{
                    url: `${server}${file.url}`,
                    type: file.type.includes("image") ? "image" : "video"
                }],
                withOptions: true
            }
        )
    }

    useEffect(() => {
        setAttachmentFile(attachment ? attachment : null)
        return () => {
            fullScreenPreview({ open: false, url: "", type: "" , ref: 0, otherUrl: [], withOptions: false})
        }
    }, [attachment, fullScreenPreview])

    return (
        <div className="flex items-center">
            {sender === user?.user_id ? (
                <div className="ml-auto max-w-[85%] md:max-w-[70%]">
                    {
                        attachment && attachment.length > 0 ? (
                            <div className="grid grid-auto-columns">
                                {attachmentFile?.map((file, index) => (
                                    <div key={index} className="p-2 cursor-pointer "
                                        onClick={() => toggleLightBox(file, index)}
                                    >
                                        {file.type.includes("image") ? (
                                            <Image
                                                priority
                                                width={300}
                                                height={300}
                                                src={`${server}/${file.url}`}
                                                alt="Uploaded image"
                                                className="w-full object-cover rounded-lg aspect-square"
                                            />
                                        ) : (
                                            <div className="relative">
                                                <div className="bg-black bg-opacity-20 absolute indent-0 w-full h-full flex items-center justify-center">
                                                    <button className="h-12 w-12 p-1 flex-shrink-0 rounded-full flex items-center justify-center bg-primary-dark-pink aspect-square">
                                                        <HiPlay className="text-white" size={50} />
                                                    </button>
                                                </div>
                                                <video
                                                    src={`${server}/${file.url}`}
                                                    className="w-full object-cover rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : ""
                    }
                    {message && (
                        <div className="bg-gray-100 p-4 rounded-3xl font-medium rounded-br-none">
                            <div className="leading-relaxed w-full text-wrap sender-link-style" dangerouslySetInnerHTML={{ __html: message || "" }}></div>
                        </div>
                    )}

                    <small className="text-xs  mt-2 pt-1 float-right flex items-center">
                        {dateString}
                        <span className={`ml-2 h-3 w-3 rounded-3xl ${seen ? "bg-primary-dark-pink" : "bg-gray-300"} inline-block`}>
                        </span>
                    </small>
                </div>
            ) : sender !== user?.user_id ? (
                <div className="max-w-[85%] md:max-w-[60%]">
                    {
                        attachment && attachment.length > 0 ? (
                            <div className="grid grid-auto-columns">
                                {attachmentFile?.map((file, index) => (
                                    <div key={index} className="p-2 cursor-pointer"
                                        onClick={() => toggleLightBox(file, index)}
                                    >
                                        {file.type.includes("image") ? (
                                            <Image
                                                priority
                                                width={300}
                                                height={300}
                                                src={`${server}/${file.url}`}
                                                alt="Uploaded image"
                                                className="w-full object-cover rounded-lg aspect-square"
                                            />
                                        ) : (
                                            <div className="relative">
                                                <div className="bg-black bg-opacity-20 absolute indent-0 w-full h-full flex items-center justify-center">
                                                    <button className="h-12 w-12 p-1 flex-shrink-0 rounded-full flex items-center justify-center bg-primary-dark-pink aspect-square">
                                                        <HiPlay className="text-white" size={50} />
                                                    </button>
                                                </div>
                                                <video
                                                    src={`${server}/${file.url}`}
                                                    className="w-full object-cover rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}</div>
                        ) : ""
                    }
                    {message && (<div className="bg-primary-dark-pink text-white font-medium p-4 rounded-3xl rounded-bl-none">
                        <div className="leading-relaxed receiver-link-style" dangerouslySetInnerHTML={{ __html: message || "" }}></div>
                    </div>)}
                    <small className="text-xs mt-2 flex items-center">
                        {dateString}
                    </small>
                </div>
            ) : ""}
        </div>
    );
}

export default MessageBubble;