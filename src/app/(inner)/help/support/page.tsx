"use client";
import { getSocket } from "@/components/sub_components/sub/Socket";
import { useUserAuthContext } from "@/lib/UserUseContext";
import {
  Send,
  Paperclip,
  Loader2,
  Star,
  Clock,
  X,
  Headphones,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const AVATAR_USER =
  "https://images.unsplash.com/photo-1748306124059-0126087eaed3?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNHx8fGVufDB8fHx8fA%3D%3D";

const StarRating = ({
  rating,
  onRating,
  size = 32,
}: {
  rating: number;
  onRating: (rating: number) => void;
  size?: number;
}) => (
  <div className="flex items-center justify-center gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <motion.div
        key={star}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Star
          size={size}
          className={`cursor-pointer transition-all duration-200 ${
            rating >= star
              ? "fill-yellow-400 text-yellow-500"
              : "fill-gray-300 text-gray-400 hover:fill-yellow-200"
          }`}
          onClick={() => onRating(star)}
        />
      </motion.div>
    ))}
  </div>
);

const SupportChatPage = () => {
  const router = useRouter();
  const { user } = useUserAuthContext();
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [agent, setAgent] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [ended, setEnded] = useState(false);
  const [review, setReview] = useState<{ rating: number; comment: string }>({
    rating: 1,
    comment: "",
  });
  const [newMessage, setNewMessage] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<any>(null);

  // Memoize the socket connection to prevent re-renders
  const socket = useMemo(() => {
    if (!user) return null;
    return getSocket();
  }, [user]);

  // Reset all state on leave
  const handleLeave = () => {
    setSession(null);
    setMessages([]);
    setAgent(null);
    setIsSending(false);
    setEnded(false);
    setReview({ rating: 1, comment: "" });
    setNewMessage("");
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (socket) {
      socket?.disconnect();
    }
  };

  // Socket connection only when user exists
  useEffect(() => {
    if (!user || !socket) return;
    socketRef.current = socket;

    // Start or restore session
    socket?.emit("support:start", { userId: user.user_id });

    socket?.on("support:session-started", (sess: any) => {
      setSession(sess);
      setMessages([]); // Reset messages on new session
      setEnded(false);
      setAgent(null);
      console.log("Support session started:", sess);

      // Session room joining is handled server-side automatically
    });

    socket?.on("support:message", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
      setIsAgentTyping(false); // Stop typing indicator on message receive
    });

    socket?.on("support:message-history", (msgs: any[]) => {
      setMessages(msgs || []);
    });

    socket?.on("support:agent-joined", (data: any) => {
      console.log("Agent joined:", data);
      setAgent({
        id: data.id || data.agentId,
        name: data.name || "Support Agent",
        avatar: data.avatar || AVATAR_USER,
        role: data.role || "Support Specialist",
        status: "online",
        rating: data.rating || 5,
      });
    });

    socket?.on("support:agent-left", () => {
      setAgent(null);
      console.log("Agent left");
    });

    socket?.on("support:agent-typing", (data: any) => {
      setIsAgentTyping(data.isTyping);
      if (data.isTyping) {
        setTimeout(() => setIsAgentTyping(false), 3000); // Hide after 3s
      }
    });

    socket?.on("support:session-ended", () => {
      setEnded(true);
      console.log("Session ended");
    });

    socket?.on("support:review-submitted", () => {
      console.log("Review submitted, redirecting...");
      if (user?.username) {
        router.push(`/${user.username}`);
      } else {
        router.push("/"); // Fallback to home
      }
    });

    socket?.on("support:error", (error: any) => {
      console.error("Support error:", error);
    });

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [user, router, socket]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message
  const handleSendMessage = () => {
    if (!session || !user || !socketRef.current || !newMessage.trim()) return;
    setIsSending(true);

    socketRef.current.emit("support:message", {
      sessionId: session._id,
      sender: "user",
      senderId: user.user_id,
      message: newMessage,
    });

    // Clear message immediately for better UX
    setNewMessage("");
    socketRef.current.emit("support:typing", {
      sessionId: session._id,
      isTyping: false,
    });

    // Reset sending state after a short delay
    setTimeout(() => setIsSending(false), 500);
  };

  // End session
  const handleEndSession = () => {
    if (!session || !socketRef.current) return;
    socketRef.current.emit("support:end", { sessionId: session._id });
    setEnded(true);
  };

  const handleUserTyping = (isTyping: boolean) => {
    if (!socketRef.current || !session) return;
    socketRef.current.emit("support:typing", {
      sessionId: session._id,
      isTyping,
    });
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    // Send typing indicator
    if (value.length > 0) {
      handleUserTyping(true);

      // Set timeout to stop typing indicator
      const timeout = setTimeout(() => {
        handleUserTyping(false);
        setTypingTimeout(null);
      }, 2000);

      setTypingTimeout(timeout);
    } else {
      handleUserTyping(false);
    }
  };

  // Submit review
  const handleSubmitReview = () => {
    if (!session || !user || !socketRef.current) return;

    // Validate rating is between 1 and 5
    if (review.rating < 1 || review.rating > 5) {
      alert("Please provide a rating between 1 and 5");
      return;
    }

    socketRef.current.emit("support:review", {
      sessionId: session._id,
      userId: user.user_id,
      rating: review.rating,
      comment: review.comment,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-400";
      case "away":
        return "bg-yellow-400";
      case "busy":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="flex flex-col w-full overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-700">
      {/* Header */}
      <div className="relative p-6 bg-primary-dark-pink">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Headphones size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Support Center</h1>
              <p className="text-white/80">
                We&apos;re here to help you succeed
              </p>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            aria-label="Leave chat"
          >
            <X size={24} />
          </button>
        </div>
      </div>
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                width={48}
                height={48}
                src={agent?.avatar || AVATAR_USER}
                alt={agent?.name || "Support"}
                className="w-12 h-12 border-2 border-white rounded-full shadow-md"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
                  agent?.status || "offline",
                )} rounded-full border-2 border-white`}
              ></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {agent?.name || "Support Agent"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isAgentTyping ? (
                  <span className="italic animate-pulse">Typing...</span>
                ) : (
                  agent?.role || "Available"
                )}
              </p>
              <div className="flex items-center mt-1 gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-gray-500">
                  {agent?.rating || 0}
                </span>
                <span className="flex items-center ml-2 text-xs text-green-500 gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Online
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-1">
              <Clock size={14} />
              Avg. response: 2 min
            </p>
          </div>
        </div>
      </div>
      {/* Chat Messages */}
      <div className="flex-1 px-6 py-6 overflow-y-auto space-y-6 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800">
        {messages.map((msg, idx) => (
          <motion.div
            key={msg._id || msg.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-4 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {(msg.sender === "support" || msg.sender === "agent") && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Image
                    width={40}
                    height={40}
                    src={agent?.avatar || AVATAR_USER}
                    alt="Support"
                    className="w-10 h-10 border-2 border-gray-200 rounded-full dark:border-gray-600 shadow-sm"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                      agent?.status || "online",
                    )} rounded-full border border-white`}
                  ></div>
                </div>
              </div>
            )}
            <div className="flex flex-col max-w-md">
              {(msg.sender === "agent" || msg.sender === "support") && (
                <div className="px-1 mb-1">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {agent?.name || "Support Agent"}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {agent?.role || "Support Specialist"}
                  </span>
                </div>
              )}
              <div
                className={`px-6 py-3 rounded-2xl shadow-sm ${
                  msg.sender === "user"
                    ? "bg-primary-dark-pink text-white rounded-br-md ml-auto"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-md"
                }`}
              >
                <span className="text-base leading-relaxed">
                  {msg.message || msg.text}
                </span>
              </div>
              <div
                className={`flex items-center gap-2 mt-2 px-1 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString()
                    : ""}
                </span>
              </div>
            </div>
            {msg.sender === "user" && (
              <Image
                width={40}
                height={40}
                src={user?.profile_image || AVATAR_USER}
                alt="You"
                className="w-10 h-10 border-2 border-gray-200 rounded-full dark:border-gray-600 shadow-sm"
              />
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isAgentTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-end justify-start gap-4"
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <Image
                  width={40}
                  height={40}
                  src={agent?.avatar || AVATAR_USER}
                  alt="Support"
                  className="w-10 h-10 border-2 border-gray-200 rounded-full dark:border-gray-600 shadow-sm"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                    agent?.status || "online",
                  )} rounded-full border border-white`}
                ></div>
              </div>
            </div>
            <div className="flex flex-col max-w-md">
              <div className="px-1 mb-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {agent?.name || "Support Agent"}
                </span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {agent?.role || "Support Specialist"}
                </span>
              </div>
              <div className="px-6 py-3 text-gray-900 bg-white border border-gray-200 rounded-2xl dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-bl-md">
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500">typing...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>
      {/* Chat Input */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900">
        {ended ? (
          <div className="p-6 text-center rounded-lg bg-gray-50 dark:bg-gray-800">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
                Chat ended. How was your experience?
              </p>
              <div className="flex flex-col items-center gap-4">
                <StarRating
                  rating={review.rating}
                  onRating={(rating) => setReview((r) => ({ ...r, rating }))}
                />
                <textarea
                  value={review.comment}
                  onChange={(e) =>
                    setReview((r) => ({ ...r, comment: e.target.value }))
                  }
                  className="w-full max-w-md px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 outline-none resize-none dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300"
                  placeholder="Leave a comment (optional)..."
                  rows={3}
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={review.rating < 1 || review.rating > 5}
                  className="w-full max-w-md px-6 py-3 mt-2 text-base font-medium text-white border border-transparent shadow-lg rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <form
            className="flex items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isSending) handleSendMessage();
            }}
          >
            <button
              type="button"
              className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              tabIndex={0}
            >
              <Paperclip
                size={20}
                className="text-gray-500 group-hover:text-purple-500 transition-colors"
              />
            </button>
            <div className="relative flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={isSending}
                placeholder="Type your message here..."
                rows={1}
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 outline-none resize-none dark:border-gray-600 rounded-xl dark:bg-gray-800 dark:text-white shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isSending) handleSendMessage();
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="p-3 font-semibold text-white shadow-lg rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:shadow-xl"
            >
              {isSending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
            <button
              type="button"
              onClick={handleEndSession}
              className="px-3 py-2 ml-2 text-gray-700 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              End Chat
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SupportChatPage;
