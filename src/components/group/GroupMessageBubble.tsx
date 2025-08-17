import {GroupMessage} from "@/contexts/GroupChatContext";
import {formatDate} from "@/lib/formatDate";
import {LucideCheck, MoreHorizontal} from "lucide-react";
import Image from "next/image";
import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useRef, useState} from "react";
import AttachmentRenderer from "./AttachmentRenderer";

interface GroupMessageBubbleProps {
    isSender: boolean;
    message: GroupMessage;
}

const GroupMessageBubble = ({isSender, message}: GroupMessageBubbleProps) => {
    const [moreOptions, setMoreOptions] = useState(false);
    const messageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                messageRef.current &&
                !messageRef.current.contains(e.target as Node)
            ) {
                setMoreOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const bubbleClasses = `
    flex flex-col w-full max-w-xs leading-tight p-3 rounded-2xl
    ${
        isSender
            ? "bg-primary-dark-pink text-white rounded-tr-none"
            : "bg-gray-100 text-gray-800 rounded-tl-none"
    }
  `;

    const dropdownClasses = `
    absolute top-full mt-2 z-10 bg-white border border-gray-200
    divide-y divide-gray-100 rounded-lg shadow-lg w-40
    dark:bg-gray-700 dark:border-gray-600 dark:divide-gray-600
    ${isSender ? "right-0" : "left-0"}
  `;

    return (
        <div
            ref={messageRef}
            className={`flex items-start gap-3 ${isSender ? "justify-end" : "justify-start"}`}
        >
            {!isSender && (
                <Image
                    width={32}
                    height={32}
                    className="object-cover w-8 h-8 rounded-full"
                    src={message.sender.profile_image}
                    alt={`${message.sender.username}'s profile`}
                />
            )}

            <div className="relative">
                <div className={bubbleClasses}>
                    <div className="flex items-center justify-between mb-1">
                        {!isSender ? (
                            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {message.sender.username}
                </span>
                                <span className="text-xs opacity-70">
                  {formatDate(message.created_at)}
                </span>
                            </div>
                        ) : (
                            <span className="text-xs opacity-90">
                {formatDate(message.created_at)}
              </span>
                        )}
                        <button
                            onClick={() => setMoreOptions(!moreOptions)}
                            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            type="button"
                            aria-label="Message options"
                            aria-expanded={moreOptions}
                        >
                            <MoreHorizontal size={16}/>
                        </button>
                    </div>
                    {message.content && (
                        <div
                            className={"mb-3"}
                            dangerouslySetInnerHTML={{
                                __html: message.content as TrustedHTML,
                            }}
                        ></div>
                    )}

                    {/* Render attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div
                            className={`space-y-2 grid gap-2 ${
                                message.attachments.length >= 4 ? "grid-cols-2" : "grid-cols-1"
                            }`}
                        >
                            {message.attachments.map((attachment, index) => (
                                <AttachmentRenderer
                                    allAttachments={message.attachments}
                                    key={attachment.id || index}
                                    attachment={attachment}
                                />
                            ))}
                        </div>
                    )}
                <div>
                {isSender && (
                    <span className={"flex items-center justify-end"}>
                       <motion.span
                            initial={{
                                color: "gray",
                                opacity: 0,
                            }}
                            animate={{
                                color: "white",
                                opacity: 1,
                            }}
                       >
                       <LucideCheck size={14}/>
                       </motion.span>
                       <motion.span
                           initial={{
                               color: "gray",
                               opacity: 0,
                               transitionDelay: 0.3
                           }}
                           animate={{
                               color: "white",
                               opacity: 1,
                           }}
                       >
                       <LucideCheck size={14} className={"-ml-3"}/>
                       </motion.span>
                   </span>
                )}
                </div>
                </div>

                <AnimatePresence>
                    {moreOptions && (
                        <motion.div
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -10}}
                            className={dropdownClasses}
                        >
                            <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                                {["Copy"].map((action) => (
                                    <li key={action}>
                                        <button
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white transition-colors">
                                            {action}
                                        </button>
                                    </li>
                                ))}
                                {!isSender && (
                                    <li>
                                        <button
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white transition-colors">
                                            Report
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GroupMessageBubble;
