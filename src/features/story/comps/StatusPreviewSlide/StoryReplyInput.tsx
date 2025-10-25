import { AnimatePresence, motion } from "framer-motion";
import { LucideSend, X } from "lucide-react";
import { useEffect, useState } from "react";
import swal from "sweetalert";
import { v4 as uuid } from "uuid";
import { usePointsStore } from "@/contexts/PointsContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import { useStoryPause } from "@/contexts/StoryPauseContext";
import type { Story } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { createNewConversation } from "@/utils/data/CreateConversation";
import { getSocket } from "../../../../components/common/Socket";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import { cn } from "@/components/ui/cn";

type StoryReplyInputProps = {
    story: Story;
};

const StoryReplyInput = ({ story }: StoryReplyInputProps) => {
    const [replyText, setReplyText] = useState("");
    const [isReplying, setIsReplying] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const { user } = useAuthContext();
    const points = usePointsStore((state) => state.points);
    const { setIsPaused } = useStoryPause();

    useEffect(() => {
        setIsPaused(showReplyInput);
    }, [showReplyInput, setIsPaused]);

    const handleReplySubmit = async () => {
        if (!replyText.trim() || !user) return;
        try {
            setIsReplying(true);
            // Get receiver's user_id and price per message
            const profileResponse = await axiosInstance.post("/profile/user", {
                username: story.user.username,
            });
            const receiverUserId = profileResponse.data.user?.user_id;
            if (!receiverUserId) {
                throw new Error("Could not find receiver user ID");
            }
            const { data } = await axiosInstance.post(
                "/points/price-per-message",
                {
                    user_id: receiverUserId,
                },
            );
            const pricePerMessage = data.price_per_message || 0;
            const currentPoints = points || 0;
            // Check if user has enough points and show confirmation
            if (pricePerMessage > 0) {
                if (currentPoints < pricePerMessage && !user.admin) {
                    return swal({
                        icon: "info",
                        title: "Insufficient Paypoints",
                        text: `You have ${currentPoints} points but need ${pricePerMessage.toLocaleString()} paypoints to send a reply to ${
                            story.user.username
                        }`,
                    });
                }
                const isToSend = await swal({
                    icon: "info",
                    title: "Notice from PayMeFans",
                    text: `Sending a reply to ${
                        story.user.username
                    } costs ${pricePerMessage.toLocaleString()} paypoints`,
                    dangerMode: true,
                    buttons: ["Cancel", "Continue"],
                });
                if (!isToSend) {
                    setIsReplying(false);
                    return;
                }
            }
            // Create or find conversation
            const conversationResponse = await createNewConversation({
                userId: user?.user_id as string,
                profileId: receiverUserId,
            });
            const conversationId = conversationResponse?.data?.conversation_id;
            if (!conversationId || conversationId.length === 0) {
                console.error("No conversation ID returned");
            }
            // Create message object for socket with story reply data
            const storyReplyData = {
                story_media_id: story.media_id,
                story_preview_url: story.media_url,
                story_type: story.media_type,
                story_owner_username: story.user.username,
                story_owner_profile_image: story.user.profile_image,
            };
            const newMessage = {
                message_id: uuid(),
                sender_id: user.user_id,
                receiver_id: receiverUserId,
                conversationId: conversationId,
                message: replyText,
                attachment: [],
                rawFiles: [],
                story_reply: storyReplyData,
                triggerSend: true,
                created_at: new Date().toISOString(),
                seen: false,
            };
            // Get socket and emit message
            const socket = getSocket();
            socket?.emit("new-message", newMessage);
            // Show success message
            swal({
                icon: "success",
                title: "Reply Sent!",
                text: "Your reply has been sent successfully",
                timer: 2000,
            });
            setReplyText("");
            setShowReplyInput(false);
        } catch (error: any) {
            console.error("Error sending reply:", error);
            if (error?.response?.data?.error === "INSUFFICIENT_POINTS") {
                swal({
                    icon: "info",
                    title: "Insufficient Paypoints",
                    text: error.response.data.message,
                });
            } else {
                swal({
                    icon: "error",
                    title: "Error",
                    text:
                        error.response?.data?.message ||
                        "Failed to send reply. Please try again.",
                });
            }
        } finally {
            setIsReplying(false);
        }
    };

    // Don't show reply input for own stories
    if (story.user.id === user?.id) {
        return null;
    }

    return (
        <div
            className={cn(
                `absolute bottom-0 w-full `,
                showReplyInput ? "z-[600] bg-black" : "z-[100] bg-transparent",
            )}
        >
            <AnimatePresence>
                {showReplyInput ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-3  bg-black w-full"
                    >
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowReplyInput(false)}
                                className="p-1 text-white/70 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Send Message`}
                                className="flex-1 px-3 py-3 text-white border bg-white/10 placeholder-white/70 border-white/20 rounded-md focus:outline-none focus:border-white/40"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isReplying) {
                                        handleReplySubmit();
                                    }
                                }}
                                disabled={isReplying}
                            />
                            <button
                                onClick={handleReplySubmit}
                                disabled={!replyText.trim() || isReplying}
                                className="p-2 text-white rounded-lg bg-primary-dark-pink disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-text-dark-pink transition-colors"
                            >
                                {isReplying ? (
                                    <LoadingSpinner className="text-white" />
                                ) : (
                                    <LucideSend className="w-5 h-5 text-white" />
                                )}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setShowReplyInput(true)}
                        className="flex items-center px-4 py-2 text-white rounded-full bg-black/50 backdrop-blur-sm gap-2 hover:bg-black/70 transition-colors"
                    >
                        <LucideSend className="w-4 h-4" />
                        <span>Reply</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StoryReplyInput;
