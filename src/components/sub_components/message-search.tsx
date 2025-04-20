"use client";

import { LucideSearch, X } from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { LucideLoader } from "lucide-react";
import axios from "axios";
import { debounce } from "lodash";
import { getToken } from "@/utils/cookie.get";
import { MessageResult } from "@/types/components";
import Image from "next/image";
import { useUserAuthContext } from "@/lib/userUseContext";

const MessageSearch = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MessageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const token = getToken();
  const { user } = useUserAuthContext();
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
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/conversations/search?q=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setResults(response.data.messages); // Update state with search results
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching search results:", error);
    }
  };

  // Debounce search function to limit API calls
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      fetchSearchResults(searchTerm);
    }, 300),
    []
  );

  // Handle input change and trigger debounced search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const searchTerm = event.target.value;
    setQuery(searchTerm);
    debouncedSearch(searchTerm);
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
      <div className="flex align-baseline justify-between border dark:text-white border-gray-400 rounded-md p-4 mb-7 w-full">
        <input
          onFocus={handleOpenSearch}
          type="text"
          placeholder="Search Messages"
          className="text-sm outline-none border-none dark:bg-gray-950 w-full"
        />
        <LucideSearch className="block text-center" />
      </div>

      {openSearch && (
        <div className="fixed loaderFade top-0 left-0 z-50 w-full h-full flex flex-col items-center justify-center bg-white dark:bg-gray-950/90 rounded-md duration-300 transition-all ease-in-out">
          <div
            onClick={handleOpenSearch}
            className="absolute cursor-pointer bottom-0 bg-white dark:bg-gray-900 w-full flex justify-center p-2"
          >
            <button>
              <X size={30} className="text-black dark:text-white" />
            </button>
          </div>

          <div className="mx-auto max-w-screen-lg p-3 w-full flex-1 py-3">
            <h1 className="md:w-3/5 mx-auto mb-4">
              <span className="text-gray-800 dark:text-white font-semibold text-lg">
                Search Messages
                <sup className="text-gray-500 dark:text-gray-400 text-xs ml-2">
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
              className="text-sm outline-none border dark:bg-gray-900 dark:text-gray-400 w-full md:w-3/5 mx-auto block py-3 px-3 rounded-lg"
            />
            {loading && (
              <div className="w-full md:w-3/5 mx-auto mt-4 space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 animate-pulse"
                  >
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              {results.length === 0 && !loading && (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
                  No results found for &quot;{query}&quot;
                </div>
              )}
            </div>

            {/* Search Results */}
            {results.length > 0 && !loading && (
              <div className="bg-white dark:bg-gray-900 py-6 rounded-xl w-full md:w-3/5 mx-auto border border-gray-200 dark:border-gray-800">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors duration-150 rounded-lg flex items-start gap-4 group"
                  >
                    <Image
                      src={result.sender.profile_image}
                      alt={result.sender.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-base dark:text-white truncate flex items-center gap-2">
                          {result.sender.name === user?.name ? (
                            <span className="text-blue-600 dark:text-blue-400">
                              You
                            </span>
                          ) : (
                            result.sender.name
                          )}
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                            @{result.sender.username}
                          </span>
                        </h4>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {new Date(result.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {result.message}
                      </p>
                      {result.attachment && result.attachment.length > 0 && (
                        <span className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium gap-1">
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
