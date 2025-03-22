"use client"
import {useUserAuthContext} from "@/lib/userUseContext";
import usePostComponent from "@/contexts/post-component-preview";
import {LucidePlay} from "lucide-react";
import Image from "next/image";
import {useEffect, useMemo, useState} from "react";
import path from "path";
import {HiPlay} from "react-icons/hi";
import {Attachment, MessageBubbleProps} from "@/types/components";


const server = process.env.NEXT_PUBLIC_TS_EXPRESS_URL_DIRECT as string

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, seen, message, date, attachment }) => {
    const { user } = useUserAuthContext();
    const { fullScreenPreview } = usePostComponent();

    const isSender = sender === user?.user_id;
    const hasAttachments = attachment && attachment.length > 0;
    const hasMessage = Boolean(message);

    // Memoize formatted date string
    const dateString = useMemo(() =>
            new Date(date).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            }),
        [date]);

    const handlePreview = (file: Attachment, index: number) => {
        fullScreenPreview({
            url: `${server}${file.url}`,
            type: file.type.includes("image") ? "image" : "video",
            open: true,
            ref: index,
            otherUrl: attachment?.map(f => ({
                url: `${server}${f.url}`,
                type: f.type
            })) || [],
            withOptions: true
        });
    };

    const renderMedia = (file: Attachment, index: number) => (
        <div key={index} className="p-2 cursor-pointer" onClick={() => handlePreview(file, index)}>
            {file.type.includes("image") ? (
                <Image
                    priority
                    width={300}
                    height={300}
                    src={`${server}${file.url}`}
                    alt="Uploaded content"
                    className="w-full object-cover rounded-lg aspect-square"
                />
            ) : (
                <div className="relative">
                    <div className="bg-black/20 absolute inset-0 w-full h-full flex items-center justify-center">
                        <button className="h-12 w-12 p-1 rounded-full flex items-center justify-center bg-primary-dark-pink aspect-square">
                            <HiPlay className="text-white" size={50} />
                        </button>
                    </div>
                    <video className="w-full object-cover rounded-lg">
                        <source src={`${server}${file.url}`} type={file.type} />
                    </video>
                </div>
            )}
        </div>
    );

    const renderContent = () => (
        <>
            {hasAttachments && (
                <div className={`grid ${attachment.length >= 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {attachment.map(renderMedia)}
                </div>
            )}

            {hasMessage && (
                <div className={`p-4 rounded-3xl font-medium ${
                    isSender
                        ? 'bg-gray-100 rounded-br-none'
                        : 'bg-primary-dark-pink text-white rounded-bl-none'
                }`}>
                    <div
                        className={`leading-relaxed w-full text-wrap ${
                            isSender ? 'sender-link-style' : 'receiver-link-style'
                        }`}
                        dangerouslySetInnerHTML={{ __html: message as TrustedHTML }}
                    />
                </div>
            )}
        </>
    );

    return (
        <div className="flex items-center">
            {isSender ? (
                <div className="ml-auto max-w-[85%] md:max-w-[60%]">
                    {renderContent()}
                    <small className="text-xs mt-2 pt-1 float-right flex items-center">
                        {dateString}
                        <span className={`ml-2 h-3 w-3 rounded-3xl ${seen ? "bg-primary-dark-pink" : "bg-gray-300"}`} />
                    </small>
                </div>
            ) : (
                <div className="max-w-[85%] md:max-w-[60%]">
                    {renderContent()}
                    <small className="text-xs mt-2 flex items-center">
                        {dateString}
                    </small>
                </div>
            )}
        </div>
    );
};

export default MessageBubble;
