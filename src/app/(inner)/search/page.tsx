"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LucideSearch,
  User,
  Hash,
  MessageCircle,
  Image,
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

const searchFunction = async (query: string) => {
  console.log("Searching...", query);
};

const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    username: "johndoe",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=300&fit=crop",
    followers: "1.2K",
    following: "340",
    posts: "156",
    bio: "Frontend Developer | React Enthusiast | Coffee Lover ☕",
    location: "San Francisco, CA",
    website: "johndoe.dev",
    joinedDate: "March 2020",
    verified: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    username: "janesmith",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&h=300&fit=crop",
    followers: "856",
    following: "124",
    posts: "89",
    bio: "Digital Artist & UI/UX Designer 🎨 Creating beautiful experiences",
    location: "New York, NY",
    website: "janesmith.art",
    joinedDate: "July 2021",
    verified: false,
  },
  {
    id: 3,
    name: "Tech Guru",
    username: "techguru",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=300&fit=crop",
    followers: "45.2K",
    following: "1.2K",
    posts: "2.1K",
    bio: "Tech Evangelist | Startup Mentor | Building the future 🚀",
    location: "Austin, TX",
    website: "techguru.io",
    joinedDate: "January 2019",
    verified: true,
  },
  {
    id: 4,
    name: "Sarah Johnson",
    username: "sarahj",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&h=300&fit=crop",
    followers: "3.7K",
    following: "512",
    posts: "421",
    bio: "Photographer | Travel Enthusiast | Storyteller",
    location: "Seattle, WA",
    website: "sarahjphotography.com",
    joinedDate: "November 2018",
    verified: true,
  },
  {
    id: 5,
    name: "Alex Chen",
    username: "alexchen",
    avatar:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=300&fit=crop",
    followers: "8.9K",
    following: "231",
    posts: "312",
    bio: "Data Scientist | AI Researcher | Coffee Addict",
    location: "Boston, MA",
    website: "alexchen.ai",
    joinedDate: "May 2020",
    verified: false,
  },
  {
    id: 6,
    name: "Emma Wilson",
    username: "emmawilson",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop",
    followers: "2.3K",
    following: "189",
    posts: "267",
    bio: "Marketing Strategist | Content Creator | Dog Mom 🐕",
    location: "Denver, CO",
    website: "emmawilson.com",
    joinedDate: "September 2021",
    verified: false,
  },
];

const mockPosts = [
  {
    id: 1,
    user: "John Doe",
    username: "johndoe",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    content:
      "Just built an amazing React app! The new features in Next.js 14 are incredible. Can't wait to share more about this project. #coding #react #nextjs",
    images: [
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop",
    ],
    time: "2h",
    likes: 245,
    retweets: 12,
    replies: 45,
    verified: true,
  },
  {
    id: 2,
    user: "Jane Smith",
    username: "janesmith",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face",
    content:
      "Beautiful sunset today! Nature never fails to amaze me. Sometimes you just need to step away from the screen and appreciate the world around us. 🌅✨",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop",
    ],
    time: "4h",
    likes: 1128,
    retweets: 234,
    replies: 89,
    verified: false,
  },
  {
    id: 3,
    user: "Tech Guru",
    username: "techguru",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    content:
      "The future of web development is looking bright with these new technologies! AI is revolutionizing how we build applications. What are your thoughts on the latest trends?",
    images: [
      "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop",
    ],
    time: "6h",
    likes: 2834,
    retweets: 1205,
    replies: 456,
    verified: true,
  },
  {
    id: 4,
    user: "Sarah Johnson",
    username: "sarahj",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face",
    content:
      "Just published my new photography series 'Urban Landscapes'. Check it out on my website! #photography #art #urban",
    images: [
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop",
    ],
    time: "8h",
    likes: 3421,
    retweets: 876,
    replies: 213,
    verified: true,
  },
];

const mockMedia = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    user: "Sarah Johnson",
    username: "sarahj",
    caption: "Exploring urban jungles 🏙️ #photography",
    time: "1d",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    user: "Jane Smith",
    username: "janesmith",
    caption: "Chasing sunsets by the sea 🌅 #nature",
    time: "2d",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
    user: "Tech Guru",
    username: "techguru",
    caption: "Tech meets art in this setup ⚙️ #tech",
    time: "3d",
  },
];

const SearchPage = () => {
  const params = useSearchParams();
  const ref = useRef<HTMLInputElement>(null);
  const search = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (ref.current) {
      const query = search.get("q") || "";
      ref.current.value = query;
      ref.current.focus();
      if (query.length > 0) {
        searchFunction(query);
      }
    }
  }, [ref, search]);

  const handleTypingSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.trim().length === 0) {
      return setSearchQuery("");
    }
    setLoading(true);
    setSearchQuery(e.target.value);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchFunction(searchQuery);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const HandleSearch = useCallback(() => {
    toast.loading(`Searching for ${searchQuery} ...`);
  }, [searchQuery]);

  const tabs = [
    { id: "all", label: "All", icon: Hash },
    { id: "people", label: "People", icon: User },
    { id: "posts", label: "Posts", icon: MessageCircle },
    { id: "media", label: "Media", icon: Image },
    { id: "videos", label: "Videos", icon: Video },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
        {/* Search Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="sticky top-0 z-20 bg-white dark:bg-gray-950 py-6 -mx-2"
        >
          <div className="relative mx-auto">
            <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-xl transition-shadow duration-300 border border-primary-dark-pink/15">
              <input
                ref={ref}
                type="text"
                name="Search"
                id="search"
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
                        className={`flex items-center px-6 py-3 rounded-lg  text-sm font-medium shadow-sm
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
        <AnimatePresence mode="wait">
          {!loading && searchQuery && mockUsers.length && mockPosts.length ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-16"
            >
              {/* People Section */}
              {(activeTab === "all" || activeTab === "people") && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <h3 className="text-2xl font-medium mb-8 flex items-center text-gray-800 dark:text-gray-200">
                    <User className="mr-3" size={24} />
                    People
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {mockUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                          ease: "easeOut",
                        }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl  overflow-hidden group"
                      >
                        <div className="relative h-32">
                          <img
                            src={user.coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <div className="absolute -bottom-8 left-6">
                            <div className="relative">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
                              />
                              {user.verified && (
                                <div className="absolute -bottom-1 -right-1 bg-primary-dark-pink rounded-full p-1">
                                  <Verified className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-6 pt-10">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                {user.name}
                              </h4>
                              <p className="text-gray-500 text-sm">
                                @{user.username}
                              </p>
                            </div>
                            <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ">
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {user.bio}
                          </p>
                          <div className="flex items-center text-gray-500 text-xs mb-4 space-x-4">
                            {user.location && (
                              <span className="flex items-center">
                                <MapPin size={12} className="mr-1" />
                                {user.location}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {user.joinedDate}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mb-6">
                            <div className="text-center">
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {user.posts}
                              </div>
                              <div className="text-gray-500 text-xs">Posts</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {user.followers}
                              </div>
                              <div className="text-gray-500 text-xs">
                                Followers
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {user.following}
                              </div>
                              <div className="text-gray-500 text-xs">
                                Following
                              </div>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 bg-primary-dark-pink hover:bg-primary-text-dark-pink text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                          >
                            Follow
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Posts Section */}
              {(activeTab === "all" || activeTab === "posts") && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <h3 className="text-2xl font-medium mb-8 flex items-center text-gray-800 dark:text-gray-200">
                    <MessageCircle className="mr-3" size={24} />
                    Posts
                  </h3>
                  <div className="space-y-6">
                    {mockPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 1,
                          delay: index * 0.1,
                          ease: "easeOut",
                        }}
                        whileHover={{ y: -2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg  overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-start space-x-4">
                            <img
                              src={post.avatar}
                              alt={post.user}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {post.user}
                                </h4>
                                {post.verified && (
                                  <Verified className="w-4 h-4 text-primary-dark-pink" />
                                )}
                                <span className="text-gray-500 text-sm">
                                  @{post.username}
                                </span>
                                <span className="text-gray-400">·</span>
                                <span className="text-gray-400 text-sm">
                                  {post.time}
                                </span>
                              </div>
                              <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
                                {post.content}
                              </p>
                            </div>
                            <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                          {post.images && post.images.length > 0 && (
                            <div
                              className={`mb-4 rounded-xl overflow-hidden ${
                                post.images.length === 1
                                  ? "max-h-96"
                                  : post.images.length === 2
                                  ? "grid grid-cols-2 gap-2 max-h-80"
                                  : post.images.length === 3
                                  ? "grid grid-cols-2 gap-2 max-h-96"
                                  : "grid grid-cols-2 gap-2 max-h-96"
                              }`}
                            >
                              {post.images.map((image, imgIndex) => (
                                <div
                                  key={imgIndex}
                                  className={`relative ${
                                    post.images.length === 3 && imgIndex === 0
                                      ? "row-span-2"
                                      : ""
                                  }`}
                                >
                                  <img
                                    src={image}
                                    alt={`Post image ${imgIndex + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  />
                                  {post.images.length === 4 &&
                                    imgIndex === 3 && (
                                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <span className="text-white text-lg font-semibold">
                                          +{post.images.length - 3}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                            {[
                              {
                                icon: MessageCircle,
                                count: post.replies,
                                color: "blue",
                              },
                              {
                                icon: Repeat2,
                                count: post.retweets,
                                color: "green",
                              },
                              { icon: Heart, count: post.likes, color: "red" },
                              { icon: Share, count: null, color: "blue" },
                            ].map((action, actionIndex) => {
                              const Icon = action.icon;
                              return (
                                <motion.button
                                  key={actionIndex}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`flex items-center space-x-1 hover:text-${action.color}-500 transition-colors group`}
                                >
                                  <div
                                    className={`p-2 rounded-full group-hover:bg-${action.color}-100 dark:group-hover:bg-${action.color}-900/30 transition-colors`}
                                  >
                                    <Icon size={16} />
                                  </div>
                                  {action.count && (
                                    <span className="text-sm">
                                      {action.count}
                                    </span>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Media Section */}
              {(activeTab === "all" || activeTab === "media") && (
                <motion.div
                  key="media"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <h3 className="text-2xl font-medium mb-8 flex items-center text-gray-800 dark:text-gray-200">
                    <Image className="mr-3" size={24} />
                    Media
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockMedia.map((media, index) => (
                      <motion.div
                        key={media.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                          ease: "easeOut",
                        }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg  overflow-hidden"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={media.image}
                            alt={media.caption}
                            className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-gray-800 dark:text-gray-200 text-sm mb-3 line-clamp-2 leading-relaxed">
                            {media.caption}
                          </p>
                          <div className="flex items-center justify-between text-gray-500 text-xs">
                            <div className="flex items-center space-x-2">
                              <img
                                src={
                                  mockUsers.find(
                                    (u) => u.username === media.username
                                  )?.avatar
                                }
                                alt={media.user}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="font-medium">{media.user}</span>
                            </div>
                            <span>{media.time}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Videos Section */}
              {activeTab === "videos" && (
                <motion.div
                  key="videos"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Video size={36} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-3">
                    No videos found
                  </h3>
                  <p className="text-gray-500">
                    No video results for "{searchQuery}"
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : !loading ? (
            <motion.div
              key="empty"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <LucideSearch size={36} className="text-primary-dark-pink" />
              </div>
              <h3 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-3">
                Search PaymeFans
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Find people, posts, and more on PaymeFans. Start typing to see
                results.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center py-20"
            >
              <div>
                <LucideLoader2 className="animate-spin text-primary-dark-pink w-12 h-12 mx-auto mb-4" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchPage;
