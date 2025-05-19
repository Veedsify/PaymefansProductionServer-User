"use client";
import { getToken } from "@/utils/cookie.get";
import { useInfiniteQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { LucideLoader2, XIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const fetchStats = async (
  userId: string | undefined,
  page: number,
  type: string,
  query: string
) => {
  const token = getToken()
  const fetchStats = await fetch(
    `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/profile/stats/${userId}/${type}?cursor=${2}&limit=${25}&query=${query}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

  if (!fetchStats.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await fetchStats.json();
  return data
};

interface ProfileStatsProps {
  userId: string | undefined;
  toggleOpen: (type: string) => void;
  type: "followers" | "following" | "subscriber";
}

const Profile = ({ user, type, toggleOpen, isFollowing }: {
  user: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
  type: "followers" | "following" | "subscriber";
  toggleOpen: (type: string) => void;
  isFollowing: boolean;
}) => {
  return (
    <div
      key={user.id}
      className="flex items-center gap-4 p-3 rounded-md hover:bg-gray-100 transition"
    >
      <Link href={`/${user.username}`}>
        <img
          src={user.avatar}
          alt="Follower Avatar"
          className="w-12 h-12 rounded-full border border-gray-200 object-cover"
        />
      </Link>
      <div className="flex-1">
        <Link href={`/${user.username}`}>
          <span className="block font-semibold text-gray-900">
            {user.name}
          </span>
        </Link>
        <Link href={`/${user.username}`}>
          <span className="block text-sm text-gray-500">
            {user.username}
          </span>
        </Link>
      </div>
      {(type === "followers" || type === "following") && (
        <>
          {
            isFollowing ? (
              <button className="px-4 py-1 rounded-full bg-gray-500 text-white text-sm font-medium hover:bg-pink-700 transition" >
                Unfollow
              </button>
            ) : (
              <button className="px-4 py-1 rounded-full bg-primary-dark-pink text-white text-sm font-medium hover:bg-pink-700 transition">
                Follow
              </button>
            )}
        </>)}
    </div >
  );
}


export const ProfileStatsComponent = ({
  userId,
  toggleOpen,
  type,
}: ProfileStatsProps) => {
  const [query, setQuery] = useState("");
  const observerRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => {
    if (type === "followers") return "Followers";
    if (type === "following") return "Following";
    return "Subscribers";
  }, [type]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["stats", userId, type, query],
    queryFn: async ({ pageParam = 1 }) =>
      await fetchStats(userId, pageParam, type, query),
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor
    },
    initialPageParam: 1,
    staleTime: 60 * 1000,
    enabled: !!userId,
  });

  const stats = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data]
  );

  const total = useMemo(
    () => data?.pages.reduce((acc, page) => page.total, 0) || 0,
    [data]
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setQuery(value);
      }, 400),
    []
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  useEffect(() => {
    refetch(); // Will re-trigger fetch with new query key
  }, [query, refetch]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div
      className="fixed inset-0 bg-black/30 flex justify-center items-center z-[200]"
      onClick={() => toggleOpen(type)}
    >
      <div
        className="bg-white w-full max-w-xl lg:rounded-lg shadow-lg p-4 h-dvh lg:max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-black/20 pb-2">
          <h1 className="font-bold text-lg">{title} {total}</h1>
          <button
            onClick={() => toggleOpen(type)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon size={24} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-4 px-1">
          <input
            type="text"
            onChange={handleInputChange}
            placeholder="Search followers"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm 
            focus:outline-none focus:ring-2 focus:ring-primary-dark-pink/50 focus:border-primary-dark-pink
            placeholder:text-gray-400 transition-all duration-200"
          />
        </div>
        {stats.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No {title.toLowerCase()} found.
          </div>
        )}
        <div className="flex flex-col gap-2 mt-4">
          {stats.map((user) => (
            <Profile
              key={user.id}
              user={user}
              type={type}
              toggleOpen={toggleOpen}
              isFollowing={Boolean(user.id % 3)} // Replace with actual following status
            />
          ))}
          {isLoading && (
            <div className="py-6 text-center flex justify-center">
              <LucideLoader2 className="animate-spin text-primary-dark-pink" size={24} />
            </div>
          )}
          {hasNextPage && (
            <div ref={observerRef} className="py-6 text-center flex justify-center">
              <LucideLoader2 className="animate-spin text-primary-dark-pink" size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
