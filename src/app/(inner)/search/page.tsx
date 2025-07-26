"use client";

import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  LucideSearch,
  User,
  Hash,
  MessageCircle,
  Image as LucideImage,
  Video,
  Heart,
  Repeat2,
  Share,
  MoreHorizontal,
  MapPin,
  Calendar,
  ExternalLink,
  Verified,
  LucideBot,
  LucideLoader2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getToken } from "@/utils/Cookie";
const token = getToken();
import Image from "next/image";
import { formatDate } from "@/utils/FormatDate";
import PostComponent from "@/components/post/PostComponent";
import { MediaPanelMediaCard } from "@/components/media/MediaPanelImageCardOther";
import { MediaDataTypeOtherProps } from "@/types/Components";
import usePostComponent from "@/contexts/PostComponentPreview";
import Link from "next/link";
import followUser from "@/utils/data/update/Follow";
import { useState as useReactState } from "react";

const searchFunction = async (query: string) => {
  try {
    const search = [
      async () => {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/search/platform?query=${query}&category=users`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.results;
      },

      async () => {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/search/platform?query=${query}&category=posts`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.results;
      },

      async () => {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/search/platform?query=${query}&category=media`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.results;
      },
    ];

    const results = await Promise.all(search.map((fn) => fn()));
    return {
      users: results[0],
      posts: results[1],
      media: results[2],
      error: false,
    };
  } catch (error) {
    console.error("Search error:", error);
    return { users: [], posts: [], media: [], error: true };
  }
};

const ReportModal = ({
  isOpen,
  onClose,
  userId,
  username,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  username: string;
}) => {
  const [reportType, setReportType] = useReactState("");
  const [reportReason, setReportReason] = useReactState("");
  const [isSubmitting, setIsSubmitting] = useReactState(false);

  const reportTypes = [
    "spam",
    "harassment",
    "inappropriate_content",
    "fake_account",
    "copyright_violation",
    "other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportType || !reportReason.trim()) {
      toast.error("Please select a report type and provide a reason");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/report/user`,
        {
          reported_id: userId,
          report_type: reportType,
          report: reportReason,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Report submitted successfully");
        onClose();
        setReportType("");
        setReportReason("");
      } else {
        toast.error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Report {username}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LucideSearch size={20} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">Select a reason</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Details
            </label>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please provide more details about this report..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <LucideLoader2 className="animate-spin w-4 h-4" />
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const FollowButton = ({
  user,
}: {
  user: { id: number; following: boolean };
}) => {
  const [isFollowing, setIsFollowing] = useState(user.following);

  useEffect(() => {
    setIsFollowing(user.following);
  }, [user.following]);

  const handleFollow = async () => {
    setIsFollowing(!isFollowing);
    try {
      const action = isFollowing ? "unfollow" : "follow";
      await followUser(user.id, action);
    } catch (error: any) {
      console.error("Error following/unfollowing user:", error);
      setIsFollowing(!isFollowing);
    }
  };
  return (
    <motion.button
      onClick={handleFollow}
      whileHover={{ scale: 1.02 }}
      className={`w-full py-3.5 ${
        isFollowing
          ? "bg-transparent hover:bg-black text-black dark:text-white border"
          : "bg-primary-dark-pink hover:bg-primary-text-dark-pink text-white"
      } rounded-xl text-sm font-semibold cursor-pointer`}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </motion.button>
  );
};

const SearchPage = () => {
  const params = useSearchParams();
  const ref = useRef<HTMLInputElement>(null);
  const search = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>(search.get("q") || "");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    userId: number;
    username: string;
  }>({
    isOpen: false,
    userId: 0,
    username: "",
  });
  const { fullScreenPreview } = usePostComponent();
  const previewImageHandler = (
    m: MediaDataTypeOtherProps,
    type: string,
    isSubscriber: boolean,
    indexId: number
  ) => {
    if (m.accessible_to === "subscribers" && !isSubscriber) return;
    const filteredMedias = media
      .filter((item) => item.media_state !== "processing")
      .filter((media) => media.accessible_to !== "price")
      .filter(
        (media) => !(media.accessible_to === "subscribers" && !isSubscriber)
      );
    // Get the new index after filtering
    const newIndexId = filteredMedias.findIndex((item) => item.id === m.id);
    const medias = filteredMedias.map((media) => ({
      url: media.url,
      type: media.media_type,
    }));
    fullScreenPreview({
      url: m.url,
      type,
      open: true,
      ref: newIndexId, // Use new index
      otherUrl: medias,
    });
  };

  const handleTypingSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.trim().length <= 2) {
      return setSearchQuery("");
    }
    setLoading(true);
    setSearchQuery(e.target.value);
    return;
  };

  useEffect(() => {
    if (!searchQuery || searchQuery.length <= 2) return;

    const delayDebounce = setTimeout(() => {
      searchFunction(searchQuery)
        .then((results) => {
          if (results.error) {
            toast.error("Error fetching search results. Please try again.", {
              id: "search",
            });
          } else {
            setPosts(results.posts || []);
            setUsers(results.users || []);
            setMedia(results.media || []);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error("Search error:", error);
          toast.error("Error fetching search results. Please try again.", {
            id: "search",
          });
          setLoading(false);
        });
    }, 300); // debounce delay (ms)

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const HandleSearch = useCallback(() => {
    if (searchQuery.trim().length === 0) {
      toast.error("Please enter a search query.");
      return;
    }
    setLoading(true);
    searchFunction(searchQuery)
      .then((results) => {
        if (results.error) {
          toast.error("Error fetching search results. Please try again.", {
            id: "search",
          });
        } else {
          setPosts(results.posts || []);
          setUsers(results.users || []);
          setMedia(results.media || []);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Search error:", error);
        toast.error("Error fetching search results. Please try again.", {
          id: "search",
        });
        setLoading(false);
      });
  }, [searchQuery]);

  const tabs = [
    { id: "all", label: "All", icon: Hash },
    { id: "people", label: "People", icon: User },
    { id: "posts", label: "Posts", icon: MessageCircle },
    { id: "media", label: "Media", icon: LucideImage },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        {/* Search Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="sticky top-0 z-20 bg-white dark:bg-black py-6 -mx-2"
        >
          <div className="relative mx-auto">
            <div className="relative overflow-hidden rounded-lg bg-white dark:bg-black dark:border-gray-700 shadow hover:shadow-xl transition-shadow duration-300 border border-primary-dark-pink/15">
              <input
                ref={ref}
                type="text"
                name="Search"
                id="search"
                autoComplete={"false"}
                defaultValue={searchQuery}
                onChange={handleTypingSearch}
                className="w-full py-4 pl-14 pr-14 bg-transparent border-0 focus:ring-0 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-base"
                placeholder="Search PaymeFans..."
              />
              <LucideBot
                className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <button
                onClick={HandleSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-primary-dark-pink hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
              >
                <LucideSearch size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              key="tabs"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="sticky top-20 z-10 bg-white dark:bg-gray-950 py-6 -mx-2"
            >
              <div className="max-w-4xl mx-auto">
                <nav className="flex flex-wrap gap-2 justify-center">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 cursor-pointer
                          ${
                            activeTab === tab.id
                              ? "bg-primary-dark-pink text-white shadow-lg shadow-primary-dark-pink/25"
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md"
                          }`}
                      >
                        <Icon size={16} className="mr-2" />
                        {tab.label}
                      </motion.button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {/* Loading State */}
            {loading && searchQuery && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-center py-32"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-dark-pink/10 rounded-full mb-6">
                  <LucideLoader2 className="animate-spin text-primary-dark-pink w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Searching...
                </h3>
                <p className="text-gray-500">
                  {searchQuery.length <= 2
                    ? `Search Query: "${searchQuery}" is too short`
                    : "Finding results for " + `"${searchQuery}"`}
                </p>
              </motion.div>
            )}

            {/* Results Found */}
            {!loading &&
              searchQuery &&
              (posts.length > 0 || users.length > 0 || media.length > 0) && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-20"
                >
                  {/* People Section */}
                  {(activeTab === "all" || activeTab === "people") &&
                    users.length > 0 && (
                      <motion.section
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="space-y-8"
                      >
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold flex items-center text-gray-800 dark:text-gray-200">
                            <User
                              className="mr-3 text-primary-dark-pink"
                              size={28}
                            />
                            People
                          </h2>
                          <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                            {users.length} result{users.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {users.map((user, index) => (
                            <motion.div
                              key={user.id}
                              initial={{ opacity: 0, y: 40 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                ease: "easeOut",
                              }}
                              whileHover={{ y: -8, scale: 1.01 }}
                              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
                            >
                              <div className="relative h-36">
                                <Image
                                  width={800}
                                  height={300}
                                  src={user.profile_banner}
                                  alt="Cover"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                <div className="absolute -bottom-10 left-6">
                                  <div className="relative">
                                    <Link href={`/${user.username}`}>
                                      <Image
                                        height={80}
                                        width={80}
                                        src={user.profile_image}
                                        alt={user.name}
                                        className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
                                      />
                                    </Link>
                                    {user.is_model && (
                                      <div className="absolute bottom-1 right-1 bg-primary-dark-pink rounded-full p-1">
                                        <Verified className="w-3.5 h-3.5 text-white" />
                                      </div>
                                    )}
                                    {user.admin && (
                                      <div className="absolute bottom-1 right-1 bg-yellow-500 rounded-full p-1">
                                        <Verified className="w-3.5 h-3.5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="p-6 pt-12">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-1">
                                      <Link href={`/${user.username}`}>
                                        {user.name}
                                      </Link>
                                    </h4>
                                    <p className="text-gray-500 dark:text-white text-sm">
                                      <Link href={`/${user.username}`}>
                                        {user.username}
                                      </Link>
                                    </p>
                                  </div>
                                  <div className="relative group">
                                    <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                      <MoreHorizontal size={20} />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                      <button
                                        onClick={() =>
                                          setReportModal({
                                            isOpen: true,
                                            userId: user.id,
                                            username: user.username,
                                          })
                                        }
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
                                      >
                                        <ExternalLink
                                          size={16}
                                          className="mr-2"
                                        />
                                        Report Account
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {user.bio && (
                                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                                    {user.bio}
                                  </p>
                                )}

                                <div className="flex items-center text-gray-500  dark:text-white text-xs mb-6 space-x-6">
                                  {user.location && (
                                    <span className="flex items-center">
                                      <MapPin size={14} className="mr-1.5" />
                                      {user.state && (
                                        <span>{user.state + " |"}</span>
                                      )}
                                      &nbsp;
                                      {user.location}
                                    </span>
                                  )}
                                  <span className="flex items-center">
                                    <Calendar size={14} className="mr-1.5" />
                                    Joined{" "}
                                    {new Date(
                                      user.created_at
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                    })}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-center mb-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <div>
                                    <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                      {user.total_followers?.toLocaleString() ||
                                        0}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      Followers
                                    </div>
                                  </div>
                                  {user.is_model && (
                                    <div>
                                      <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                        {user.total_subscribers?.toLocaleString() ||
                                          0}
                                      </div>
                                      <div className="text-gray-500 text-xs">
                                        Subscribers
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                      {user.total_following?.toLocaleString() ||
                                        0}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      Following
                                    </div>
                                  </div>
                                </div>

                                <FollowButton user={user} />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.section>
                    )}

                  {/* Posts Section */}
                  {(activeTab === "all" || activeTab === "posts") &&
                    posts.length > 0 && (
                      <motion.section
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="space-y-8"
                      >
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold flex items-center text-gray-800 dark:text-gray-200">
                            <MessageCircle
                              className="mr-3 text-primary-dark-pink"
                              size={28}
                            />
                            Posts
                          </h2>
                          <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                            {posts.length} result{posts.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="space-y-8">
                          {posts.map((post, index) => (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.6,
                                delay: index * 0.1,
                                ease: "easeOut",
                              }}
                              whileHover={{ y: -2 }}
                              className="transform transition-transform duration-200"
                            >
                              <PostComponent
                                user={{
                                  id: post?.user?.id,
                                  user_id: post?.user?.user_id,
                                  name: post?.user?.name,
                                  link: `/${post?.user?.username}`,
                                  username: post?.user?.username,
                                  image: post?.user?.profile_image,
                                }}
                                data={{
                                  ...post,
                                  post: post?.content,
                                  media: post?.UserMedia,
                                  time: formatDate(new Date(post?.created_at)),
                                }}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </motion.section>
                    )}

                  {/* Media Section */}
                  {(activeTab === "all" || activeTab === "media") &&
                    media.length > 0 && (
                      <motion.section
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="space-y-8"
                      >
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold flex items-center text-gray-800 dark:text-gray-200">
                            <LucideImage
                              className="mr-3 text-primary-dark-pink"
                              size={28}
                            />
                            Media
                          </h2>
                          <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                            {media.length} result{media.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {media.map((m, index) => (
                            <motion.div
                              key={m.id}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                ease: "easeOut",
                              }}
                              whileHover={{ y: -4, scale: 1.02 }}
                              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group"
                            >
                              <div className="relative overflow-hidden">
                                <MediaPanelMediaCard
                                  media={{
                                    ...m,
                                    isSubscribed: true,
                                  }}
                                  PreviewImageHandler={previewImageHandler}
                                  indexId={index}
                                />
                              </div>
                              <div className="p-4 space-y-3">
                                <Link href={`/posts/${m.post.post_id}`}>
                                  <p className="text-gray-800 dark:text-gray-200 text-sm line-clamp-2 leading-relaxed hover:text-primary-dark-pink transition-colors">
                                    {m.post.content}
                                  </p>
                                </Link>
                                <div className="flex items-center justify-between text-gray-500 text-xs pt-2 border-t border-gray-100 dark:border-gray-700">
                                  <div className="flex items-center space-x-2">
                                    <Image
                                      width={24}
                                      height={24}
                                      src={m.user.profile_image}
                                      alt={m.user.name}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span className="font-medium truncate">
                                      {m.user.name}
                                    </span>
                                  </div>
                                  <span className="text-xs">
                                    {formatDate(m.created_at)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.section>
                    )}
                </motion.div>
              )}

            {/* No Results Found */}
            {!loading &&
              searchQuery &&
              posts.length === 0 &&
              users.length === 0 &&
              media.length === 0 && (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-center py-32"
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-8">
                    <LucideSearch size={48} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    No results found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    We couldn&apos;t find anything for &quot;
                    <span className="font-medium">{searchQuery}</span> &quot;.
                    Try using different keywords or check your spelling.
                  </p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Try searching for:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        usernames
                      </span>
                      <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        hashtags
                      </span>
                      <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        keywords
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

            {/* Initial State */}
            {!loading && !searchQuery && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-center py-32"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-primary-dark-pink/10 to-primary-dark-pink/5 rounded-full flex items-center justify-center mx-auto mb-8">
                  <LucideSearch size={48} className="text-primary-dark-pink" />
                </div>
                <h3 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Discover PaymeFans
                </h3>
                <p className="text-gray-500 max-w-lg mx-auto mb-8 text-lg">
                  Search for people, posts, and media content. Connect with
                  creators and discover amazing content.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  <span className="bg-primary-dark-pink/10 text-primary-dark-pink px-4 py-2 rounded-full font-medium">
                    People
                  </span>
                  <span className="bg-primary-dark-pink/10 text-primary-dark-pink px-4 py-2 rounded-full font-medium">
                    Posts
                  </span>
                  <span className="bg-primary-dark-pink/10 text-primary-dark-pink px-4 py-2 rounded-full font-medium">
                    Media
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() =>
          setReportModal({ isOpen: false, userId: 0, username: "" })
        }
        userId={reportModal.userId}
        username={reportModal.username}
      />
    </div>
  );
};

export default SearchPage;
