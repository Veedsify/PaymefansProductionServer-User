"use client";

import axios from "axios";
import { debounce } from "lodash";
import { LucideLoader, LucideSearch, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { MessageResult } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";

const MessageSearch = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MessageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthContext();
  const handleOpenSearch = () => setOpenSearch(!openSearch);

  useEffect(() => {
    if (openSearch) {
      inputRef.current?.focus();
    }
  }, [openSearch]);

  // Function to fetch search results
  const fetchSearchResults = async (searchTerm: string) => {
    if (searchTerm.trim() === "") {
      setResults([]); // Clear results if search term is empty
      setLoading(false);
      return;
    } // Avoid empty searches
    try {
      const response = await axiosInstance.get(
        `/conversations/search?q=${searchTerm}`,
      );
      console.log(response.data);
      setResults(response.data.messages); // Update state with search results
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching search results:", error);
    }
  };

  // Debounce search function using setTimeout
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const searchTerm = event.target.value;
    setQuery(searchTerm);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchSearchResults(searchTerm);
    }, 300);
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenSearch(false);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div>
      <div className="flex justify-between w-full p-4 align-baseline outline dark:text-white outline-gray-400 rounded-md mb-7">
        <input
          onFocus={handleOpenSearch}
          type="text"
          placeholder="Search Messages"
          className="w-full text-sm border-none outline-none dark:bg-black dark:text-white"
        />
        <LucideSearch className="block text-center" />
      </div>

      {openSearch && (
        <div className="fixed loaderFade top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-white dark:bg-gray-950/90 rounded-md duration-300 transition-all ease-in-out z-[200]">
          <div
            onClick={handleOpenSearch}
            className="absolute bottom-0 flex justify-center w-full p-2 bg-white cursor-pointer dark:bg-gray-900"
          >
            <button>
              <X size={30} className="text-black dark:text-white" />
            </button>
          </div>

          <div className="flex-1 w-full p-3 py-3 mx-auto max-w-screen-lg ">
            <h1 className="mx-auto mb-4 md:w-3/5">
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                Search Messages
                <sup className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (ESC to close)
                </sup>
              </span>
            </h1>
            <input
              type="text"
              ref={inputRef}
              value={query}
              onChange={handleSearchChange}
              placeholder="Search Messages"
              className="block w-full px-3 py-3 mx-auto text-sm border rounded-lg outline-none dark:bg-gray-900 dark:text-gray-400 md:w-3/5"
            />
            {loading && (
              <div className="w-full mx-auto mt-4 md:w-3/5 space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 animate-pulse"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-24 h-4 bg-gray-200 rounded dark:bg-gray-700" />
                        <div className="w-16 h-3 bg-gray-200 rounded dark:bg-gray-700" />
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-3 bg-gray-200 rounded dark:bg-gray-700" />
                        <div className="w-4/5 h-3 bg-gray-200 rounded dark:bg-gray-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              {results.length === 0 && !loading && (
                <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
                  No results found for &quot;{query}&quot;
                </div>
              )}
            </div>

            {/* Search Results */}
            {results.length > 0 && !loading && (
              <div className="bg-white dark:bg-gray-900 py-6 rounded-xl w-full md:w-3/5 mx-auto border border-gray-200 dark:border-gray-800  max-h-[85vh] overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-start p-4 border-b border-gray-100 rounded-lg last:border-b-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors duration-150 gap-4 group"
                  >
                    <Image
                      src={result.sender.profile_image}
                      alt={result.sender.name}
                      width={48}
                      height={48}
                      className="object-cover w-12 h-12 rounded-full ring-2 ring-blue-100 dark:ring-blue-900 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="flex items-center text-base font-semibold truncate dark:text-white gap-2">
                          {result.sender.name === user?.name ? (
                            <span className="text-blue-600 dark:text-blue-400">
                              You
                            </span>
                          ) : (
                            result.sender.name
                          )}
                          <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                            {result.sender.username}
                          </span>
                        </h4>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {new Date(result.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <Link
                        href={`/chats/${result.conversationsId}?message_id=${result.message_id}`}
                        className="text-sm leading-relaxed text-gray-700 cursor-pointer dark:text-gray-300 line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"
                      >
                        {result.message}
                      </Link>
                      {result.attachment && result.attachment.length > 0 && (
                        <span className="inline-flex items-center mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l7.07-7.07a4 4 0 00-5.656-5.657l-8.485 8.485a6 6 0 108.485 8.485l6.364-6.364"
                            />
                          </svg>
                          {result.attachment.length} attachment
                          {result.attachment.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageSearch;
