"use client";

import {
  Send,
  X,
  Paperclip,
  Check,
  Loader2,
  MessageCircle,
  User,
  Headphones,
  Star,
  Clock,
} from "lucide-react";
import React, { SetStateAction, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getSocket } from "./sub/Socket";
import { useUserAuthContext } from "@/lib/UserUseContext";

// Helper types
type Message = {
  id: number;
  text: string;
  sender: "user" | "support";
  time: string;
  status?: "sent" | "seen" | "sending";
  agentName?: string;
  agentRole?: string;
};

type Agent = {
  name: string;
  role: string;
  avatar: string;
  status: "online" | "away" | "busy";
  rating: number;
};

const AVATAR_USER = "https://randomuser.me/api/portraits/men/75.jpg";

const ContactSupportModal = () => {
  const { user } = useUserAuthContext();
  const [show, setShow] = useState(false);
  const [activeTab, setActiveTab] = useState<"contact" | "chat">("contact");
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [agent, setAgent] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSupportTyping, setIsSupportTyping] = useState(false);
  const [ended, setEnded] = useState(false);
  const [review, setReview] = useState<{ rating: number; comment: string }>({
    rating: 0,
    comment: "",
  });
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<any>(null);

  // Reset all state on close
  const handleClose = () => {
    setShow(false);
    setActiveTab("contact");
    setSession(null);
    setMessages([]);
    setAgent(null);
    setIsSending(false);
    setIsSupportTyping(false);
    setEnded(false);
    setReview({ rating: 0, comment: "" });
    setNewMessage("");
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // Socket connection only when modal is open and user exists
  useEffect(() => {
    if (!user || !show || activeTab !== "chat") return;
    const socket = getSocket();
    socketRef.current = socket;

    // Start or restore session
    socket?.emit("support:start", { userId: user.user_id });

    socket?.on("support:session-started", (sess: any) => {
      setSession(sess);
      setMessages([]); // Reset messages on new session
      setEnded(false);
      setAgent(null);
      socket?.emit("support:waiting-list");
      socket?.emit("support:message-history", { sessionId: sess._id });
    });
    socket?.on("support:message", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket?.on("support:agent-joined", (agentInfo: any) => {
      setAgent(agentInfo);
    });
    socket?.on("support:agent-left", () => {
      setAgent(null);
    });
    socket?.on("support:session-ended", () => {
      setEnded(true);
    });
    socket?.on("support:review-submitted", () => {
      setEnded(true);
    });
    socket?.on("support:message-history", (msgs: any[]) => {
      setMessages(msgs || []);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, show, activeTab]);

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
    setIsSending(false);
    setNewMessage("");
  };

  // End session
  const handleEndSession = () => {
    if (!session || !socketRef.current) return;
    socketRef.current.emit("support:end", { sessionId: session._id });
    setEnded(true);
  };

  // Submit review
  const handleSubmitReview = () => {
    if (!session || !user || !socketRef.current) return;
    socketRef.current.emit("support:review", {
      sessionId: session._id,
      userId: user.user_id,
      rating: review.rating,
      comment: review.comment,
    });
    setEnded(true);
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

  // Enhanced tab button style
  const tabBtn = (active: boolean) =>
    `flex-1 text-center pb-3 pt-4 font-semibold text-lg transition-all duration-300 border-b-3 relative overflow-hidden ${
      active
        ? "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/20"
        : "border-transparent text-gray-500 hover:text-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800"
    }`;

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="group relative px-4 py-2 text-sm text-nowrap bg-white text-primary-dark-pink hover:bg-primary-dark-pink hover:text-white rounded-md cursor-pointer transition-all duration-300 font-semibold focus:outline-none focus:ring-4 focus:ring-purple-300 overflow-hidden"
      >
        <span className="relative flex items-center gap-3 z-10">
          <MessageCircle
            size={20}
            className="group-hover:rotate-12 transition-transform duration-300"
          />
          Contact Support
        </span>
        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></span>
      </button>
      {show && (
        <div
          className="fixed inset-0 z-50 loaderFade bg-black/60 transition-all flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          tabIndex={-1}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, type: "spring", damping: 20 }}
            className="relative h-dvh w-full lg:max-w-3xl bg-white dark:bg-gray-900 lg:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col lg:max-h-[90vh] overflow-hidden"
            tabIndex={0}
            aria-label="Contact support modal"
          >
            {/* Gradient Header */}
            <div className="relative bg-primary-dark-pink p-6">
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
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <button
                onClick={() => setActiveTab("contact")}
                className={tabBtn(activeTab === "contact")}
                tabIndex={0}
              >
                <span className="flex items-center gap-2 justify-center">
                  <Send size={18} />
                  Contact Form
                </span>
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={tabBtn(activeTab === "chat")}
                tabIndex={0}
              >
                <span className="flex items-center gap-2 justify-center">
                  <MessageCircle size={18} />
                  Live Chat
                </span>
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {/* Contact Tab */}
              {activeTab === "contact" && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 p-8 overflow-auto bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
                >
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Get in Touch
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        Send us a message and we&apos;ll respond within 24 hours
                      </p>
                    </div>

                    <form className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="name"
                            className="block mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200"
                          >
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="block mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200"
                          >
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300"
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="subject"
                          className="block mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200"
                        >
                          Subject
                        </label>
                        <input
                          type="text"
                          id="subject"
                          className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300"
                          placeholder="How can we help you today?"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block mb-3 text-sm font-semibold text-gray-900 dark:text-gray-200"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          rows={6}
                          className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300 resize-none"
                          placeholder="Tell us more about your request..."
                          required
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="w-full group relative px-8 py-3 bg-primary-dark-pink text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-semibold text-lg overflow-hidden"
                      >
                        <span className="relative flex items-center justify-center gap-3 z-10">
                          <Send
                            size={20}
                            className="group-hover:rotate-12 transition-transform duration-300"
                          />
                          Send Message
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Live Chat Tab */}
              {activeTab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col flex-1 min-h-[500px] w-full"
                >
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
                            className="w-12 h-12 rounded-full border-2 border-white shadow-md"
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
                            {agent?.role || "Available"}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star
                              size={12}
                              className="fill-yellow-400 text-yellow-400"
                            />
                            <span className="text-xs text-gray-500">
                              {agent?.rating || 0}
                            </span>
                            <span className="text-xs text-green-500 ml-2 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock size={14} />
                          Avg. response: 2 min
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800">
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={msg._id || msg.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-end gap-4 ${
                          msg.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {msg.sender === "support" && (
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <Image
                                width={40}
                                height={40}
                                src={agent?.avatar || AVATAR_USER}
                                alt="Support"
                                className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                              />
                              <div
                                className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                                  agent?.status || "offline",
                                )} rounded-full border border-white`}
                              ></div>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col max-w-md">
                          {msg.sender === "support" && msg.agentName && (
                            <div className="mb-1 px-1">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {msg.agentName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {msg.agentRole}
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
                              {msg.text || msg.message}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-2 mt-2 px-1 ${
                              msg.sender === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {msg.time || msg.createdAt || ""}
                            </span>
                          </div>
                        </div>
                        {msg.sender === "user" && (
                          <Image
                            width={40}
                            height={40}
                            src={user?.profile_image || AVATAR_USER}
                            alt="You"
                            className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                          />
                        )}
                      </motion.div>
                    ))}
                    {/* Typing indicator */}
                    {isSupportTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-end gap-4 justify-start"
                      >
                        <div className="relative">
                          <Image
                            width={40}
                            height={40}
                            src={agent?.avatar || AVATAR_USER}
                            alt="Support"
                            className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                              agent?.status || "offline",
                            )} rounded-full border border-white`}
                          ></div>
                        </div>
                        <div className="flex flex-col max-w-xs">
                          <div className="mb-1 px-1">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {agent?.name || "Support"}
                            </span>
                          </div>
                          <div className="px-6 py-4 rounded-2xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm rounded-bl-md">
                            <span className="flex gap-1 items-center">
                              <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                              <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></span>
                              <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></span>
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                            {agent?.name || "Support"} is typing...
                          </span>
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  {/* Chat Input */}
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    {ended ? (
                      <div className="text-center">
                        <p className="mb-4 text-lg text-gray-700 dark:text-gray-200">
                          Chat ended. Please leave a review:
                        </p>
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={review.rating}
                            onChange={(e) =>
                              setReview((r) => ({
                                ...r,
                                rating: Number(e.target.value),
                              }))
                            }
                            className="border rounded px-2 py-1 w-20 text-center"
                            placeholder="Rating (1-5)"
                          />
                          <textarea
                            value={review.comment}
                            onChange={(e) =>
                              setReview((r) => ({
                                ...r,
                                comment: e.target.value,
                              }))
                            }
                            className="border rounded px-2 py-1 w-full"
                            placeholder="Leave a comment..."
                          />
                          <button
                            onClick={handleSubmitReview}
                            className="mt-2 bg-primary-dark-pink text-white px-4 py-2 rounded"
                          >
                            Submit Review
                          </button>
                        </div>
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
                        <div className="flex-1 relative">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isSending}
                            placeholder="Type your message here..."
                            rows={1}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300 resize-none"
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
                          className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
                          className="ml-2 px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          End Chat
                        </button>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ContactSupportModal;
