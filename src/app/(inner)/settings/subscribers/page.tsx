"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { LucideLoader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import FetchActiveSubscribers from "@/utils/data/FetchActiveSubscribers";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

function Page() {
  const {
    data,
    isError,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["active-subscribers"],
    queryFn: async ({ pageParam }) => FetchActiveSubscribers(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.nextCursor) {
        return lastPage.nextCursor;
      }
    },
    initialPageParam: 0,
  });
  const subscribers = data?.pages.flatMap((page) => page.data || []);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      // Fetch the next page when the ref is in view
      fetchNextPage();
    }
  });

  return (
    <>
      <div className={"p-4 md:p-8"}>
        <h1 className="block mb-4 text-xl font-bold lg:hidden">
          Active Subscribers
        </h1>
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error loading subscribers.</p>}
        <ul className="space-y-4">
          {subscribers?.map((subscriber) => (
            <li
              key={subscriber.id}
              className="p-4 cursor-pointer bg-gray-50 dakr:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Link href={`/${subscriber.username}`}>
                  <Image
                    width={48}
                    height={48}
                    src={subscriber.profile_image}
                    alt={subscriber.name}
                    className="w-12 h-12 rounded-full"
                  />
                </Link>
                <div>
                  <Link href={`/${subscriber.username}`}>
                    <h2 className="text-lg font-semibold">{subscriber.name}</h2>
                    <p className="text-sm text-gray-600">
                      {subscriber.username}
                    </p>
                  </Link>
                </div>
              </div>
            </li>
          ))}
          <div className="flex items-center justify-center mt-4">
            {isFetchingNextPage && (
              <LoadingSpinner className=" text-gray-500 " />
            )}
          </div>
          {!hasNextPage && (
            <p className="mt-4 text-center text-gray-500">
              No more subscribers to load.
            </p>
          )}
        </ul>
        <div ref={ref}></div>
      </div>
    </>
  );
}

export default Page;
