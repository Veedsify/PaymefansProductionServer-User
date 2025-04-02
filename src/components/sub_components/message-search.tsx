"use client";

import { LucideSearch, X } from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { LucideLoader } from "lucide-react";
import axios from "axios";
import { debounce } from "lodash";
import { getToken } from "@/utils/cookie.get";

const MessageSearch = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const token = getToken();
  const handleOpenSearch = () => setOpenSearch(!openSearch);

  useEffect(() => {
    if (openSearch) {
      inputRef.current?.focus();
    }
  }, [openSearch]);

  // Function to fetch search results
  const fetchSearchResults = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
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
  const debouncedSearch = useCallback(debounce(fetchSearchResults, 300), [
    fetchSearchResults,
  ]);

  // Handle input change and trigger debounced search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const searchTerm = event.target.value;
    setQuery(searchTerm);
    debouncedSearch(searchTerm);
  };

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
        <div className="fixed animate-in top-0 left-0 z-50 w-full h-full flex flex-col items-center justify-center bg-gray-100/90 dark:bg-gray-950/90 rounded-md duration-300 transition-all ease-in-out">
          {/*<div onClick={handleOpenSearch}*/}
          {/*     className="absolute cursor-pointer bottom-0 bg-white dark:bg-gray-900 w-full flex justify-center p-2">*/}
          {/*    <button>*/}
          {/*        <X size={30} className="text-black dark:text-white"/>*/}
          {/*    </button>*/}
          {/*</div>*/}

          <div className="mx-auto max-w-screen-lg p-3 w-full flex-1 py-3">
            <input
              type="text"
              ref={inputRef}
              value={query}
              onChange={handleSearchChange}
              placeholder="Search Messages"
              className="text-sm outline-none border dark:bg-gray-900 dark:text-gray-400 w-full md:w-3/5 mx-auto block py-3 px-3 rounded-lg"
            />
            {loading && (
              <div className={"flex justify-center p-3"}>
                <LucideLoader
                  size={30}
                  className="text-gray-500 dark:text-white animate-spin"
                />
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && !loading && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-lg w-full md:w-3/5 mx-auto">
                {results.map((result, index) => (
                  <div key={index} className="py-2 border-b last:border-b-0">
                    {JSON.stringify(result)}
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
