"use client";
import {
  Calendar,
  ExternalLink,
  Hash,
  LucideBot,
  Image as LucideImage,
  LucideSearch,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  User,
  Verified,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { MediaDataTypeOtherProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { formatDate } from "@/utils/FormatDate";
import FormatName from "@/lib/FormatName";
import usePostComponent from "@/contexts/PostComponentPreview";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

const searchFunction = async (query: string) => {
  try {
    const search = [
      async () => {
        const response = await axiosInstance.get(
          `/search/platform?query=${query}&category=users`
        );
        return response.data.results;
      },

      async () => {
        const response = await axiosInstance.get(
          `/search/platform?query=${query}&category=posts`
        );
        return response.data.results;
      },

      async () => {
        const response = await axiosInstance.get(
          `/search/platform?query=${query}&category=media`
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

const ReportModal = dynamic(() => import("@/components/ReportModal"), {
  ssr: false,
});
const FollowButton = dynamic(() => import("@/components/FollowButton"));
const PostComponent = dynamic(() => import("@/features/post/PostComponent"));
const MediaPanelMediaCard = dynamic(() =>
  import("@/features/media/MediaPanelImageCardOther").then(
    (mod) => mod.MediaPanelMediaCard
  )
);

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
  const { user: authUser } = useAuthContext();
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    userId: number;
    username: string;
  }>({
    isOpen: false,
    userId: 0,
    username: "",
  });
  const fullScreenPreview = usePostComponent(
    (state) => state.fullScreenPreview
  );
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
      userProfile: null,
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
    <div className="min-h-dvh text-gray-900 bg-white dark:bg-black dark:text-gray-100">
      <div className="max-w-6xl px-4 py-6 mx-auto lg:px-6">
        {/* Search Bar */}
        <div className="sticky top-0 z-20 py-6 -mx-2 bg-white/95 backdrop-blur-sm dark:bg-black/95">
          <div className="relative mx-auto max-w-2xl">
            <div className="relative overflow-hidden bg-white border rounded-md shadow-sm dark:bg-black dark:border-gray-700  transition-all duration-300 border-black/20">
              <input
                ref={ref}
                type="text"
                name="Search"
                id="search"
                autoComplete={"false"}
                defaultValue={searchQuery}
                onChange={handleTypingSearch}
                className="w-full py-5 text-base text-gray-900 placeholder-gray-500 bg-transparent border-0 outline-none pl-16 pr-16 focus:ring-2 focus:ring-primary-dark-pink/60 transition-all duration-200 dark:text-gray-100 dark:placeholder-gray-400"
                placeholder="Search PaymeFans..."
              />
              <LucideBot
                className="absolute text-gray-400 left-6 top-1/2 transform -translate-y-1/2"
                size={20}
              />
              <button
                onClick={HandleSearch}
                className="absolute p-3 text-gray-400 rounded-lg right-4 top-1/2 transform -translate-y-1/2 hover:text-primary-dark-pink hover:bg-primary-dark-pink/10 dark:hover:bg-primary-dark-pink/20 transition-all duration-200"
              >
                <LucideSearch size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {searchQuery && (
          <div className="sticky z-10 py-6 -mx-2 bg-white top-20 dark:bg-gray-950">
            <div className="max-w-4xl mx-auto">
              <nav className="flex flex-wrap justify-center gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 cursor-pointer
                        ${
                          activeTab === tab.id
                            ? "bg-primary-dark-pink text-white border"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md"
                        }`}
                    >
                      <Icon size={16} className="mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-8">
          {/* Loading State */}
          {loading && searchQuery && (
            <div className="py-32 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary-dark-pink/10">
                <LoadingSpinner />
              </div>
              <h3 className="mb-2 text-xl font-medium text-gray-700 dark:text-gray-300">
                Searching...
              </h3>
              <p className="text-gray-500">
                {searchQuery.length <= 2
                  ? `Search Query: "${searchQuery}" is too short`
                  : "Finding results for " + `"${searchQuery}"`}
              </p>
            </div>
          )}

          {/* Results Found */}
          {!loading &&
            searchQuery &&
            (posts.length > 0 || users.length > 0 || media.length > 0) && (
              <div className="space-y-20">
                {/* People Section */}
                {(activeTab === "all" || activeTab === "people") &&
                  users.length > 0 && (
                    <section className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h2 className="flex items-center text-xl font-semibold text-gray-800 dark:text-gray-200">
                          <User
                            className="mr-3 text-primary-dark-pink"
                            size={28}
                          />
                          People
                        </h2>
                        <span className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full dark:bg-gray-800">
                          {users.length} result{users.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {users.map((user, index) => (
                          <div
                            key={user.id}
                            className="overflow-hidden bg-white border border-gray-300 dark:bg-gray-800 rounded-lg  transition-all duration-300 dark:border-gray-700"
                          >
                            <div className="relative h-36">
                              <Image
                                width={800}
                                height={144}
                                src={user.profile_banner}
                                alt="Cover"
                                className="object-cover w-full max-h-36 inline-block transition-transform duration-300"
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
                                      className="object-cover w-20 h-20 border-4 border-white rounded-full shadow-lg dark:border-gray-800"
                                    />
                                  </Link>
                                  {user.is_model && (
                                    <div className="absolute p-1 rounded-full bottom-1 right-1 bg-primary-dark-pink">
                                      <Verified className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                  {user.admin && (
                                    <div className="absolute p-1 bg-yellow-500 rounded-full bottom-1 right-1">
                                      <Verified className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="p-6 pt-12">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h4 className="mb-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    <Link href={`/${user.username}`}>
                                      {FormatName(user.name)}
                                    </Link>
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-white">
                                    <Link href={`/${user.username}`}>
                                      {user.username}
                                    </Link>
                                  </p>
                                </div>
                                {user.id !== authUser?.id && (
                                  <div className="relative group">
                                    <button className="p-2 text-gray-400 rounded-full hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                      >
                                        <ExternalLink
                                          size={16}
                                          className="mr-2"
                                        />
                                        Report Account
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {user.bio && (
                                <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-3">
                                  {user.bio}
                                </p>
                              )}

                              <div className="flex items-center mb-6 text-xs text-gray-500  dark:text-white space-x-6">
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
                                  {new Date(user.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                    }
                                  )}
                                </span>
                              </div>

                              <div className="py-4 mb-6 text-center rounded-lg grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/50">
                                <div>
                                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {user.total_followers?.toLocaleString() ||
                                      0}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Followers
                                  </div>
                                </div>
                                {user.is_model && (
                                  <div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                      {user.total_subscribers?.toLocaleString() ||
                                        0}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Subscribers
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {user.total_following?.toLocaleString() ||
                                      0}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Following
                                  </div>
                                </div>
                              </div>
                              {user.id !== authUser?.id && (
                                <FollowButton user={user} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                {/* Posts Section */}
                {(activeTab === "all" || activeTab === "posts") &&
                  posts.length > 0 && (
                    <section className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h2 className="flex items-center text-xl font-semibold text-gray-800 dark:text-gray-200">
                          <MessageCircle
                            className="mr-3 text-primary-dark-pink"
                            size={28}
                          />
                          Posts
                        </h2>
                        <span className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full dark:bg-gray-800">
                          {posts.length} result{posts.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="space-y-8">
                        {posts.map((post, index) => (
                          <div
                            key={post.id}
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
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                {/* Media Section */}
                {(activeTab === "all" || activeTab === "media") &&
                  media.length > 0 && (
                    <section className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h2 className="flex items-center text-xl font-semibold text-gray-800 dark:text-gray-200">
                          <LucideImage
                            className="mr-3 text-primary-dark-pink"
                            size={28}
                          />
                          Media
                        </h2>
                        <span className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full dark:bg-gray-800">
                          {media.length} result{media.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {media.map((m, index) => (
                          <div
                            key={m.id}
                            className="overflow-hidden bg-white border border-gray-100 dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 dark:border-gray-700 group"
                          >
                            <div className="relative overflow-hidden">
                              <MediaPanelMediaCard
                                media={{
                                  ...m,
                                }}
                                PreviewImageHandler={previewImageHandler}
                                indexId={index}
                                profileUserId={m.post.user.id}
                              />
                            </div>
                            <div className="p-4 space-y-3">
                              <Link href={`/posts/${m.post.post_id}`}>
                                <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 line-clamp-2 hover:text-primary-dark-pink transition-colors">
                                  {m.post.content}
                                </p>
                              </Link>
                              <div className="flex items-center justify-between pt-2 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                  <Image
                                    width={24}
                                    height={24}
                                    src={m.user.profile_image}
                                    alt={m.user.name}
                                    className="object-cover w-6 h-6 rounded-full"
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
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
              </div>
            )}

          {/* No Results Found */}
          {!loading &&
            searchQuery &&
            posts.length === 0 &&
            users.length === 0 &&
            media.length === 0 && (
              <div className="py-32 text-center">
                <div className="flex items-center justify-center w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700">
                  <LucideSearch size={48} className="text-gray-400" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-gray-700 dark:text-gray-300">
                  No results found
                </h3>
                <p className="max-w-md mx-auto mb-6 text-gray-500">
                  We couldn&apos;t find anything for &quot;
                  <span className="font-medium">{searchQuery}</span> &quot;. Try
                  using different keywords or check your spelling.
                </p>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>Try searching for:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-full dark:bg-gray-800">
                      usernames
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full dark:bg-gray-800">
                      hashtags
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full dark:bg-gray-800">
                      keywords
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Initial State */}
          {!loading && !searchQuery && (
            <div className="py-32 text-center">
              <div className="flex items-center justify-center w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary-dark-pink/10 to-primary-dark-pink/5">
                <LucideSearch size={48} className="text-primary-dark-pink" />
              </div>
              <h3 className="mb-4 text-3xl font-semibold text-gray-700 dark:text-gray-300">
                Discover PaymeFans
              </h3>
              <p className="max-w-lg mx-auto mb-8 text-lg text-gray-500">
                Search for people, posts, and media content. Connect with
                creators and discover amazing content.
              </p>
              <div className="flex flex-wrap justify-center text-sm gap-2">
                <span className="px-4 py-2 font-medium rounded-xl bg-primary-dark-pink/10 text-primary-dark-pink">
                  People
                </span>
                <span className="px-4 py-2 font-medium rounded-xl bg-primary-dark-pink/10 text-primary-dark-pink">
                  Posts
                </span>
                <span className="px-4 py-2 font-medium rounded-xl bg-primary-dark-pink/10 text-primary-dark-pink">
                  Media
                </span>
              </div>
            </div>
          )}
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
