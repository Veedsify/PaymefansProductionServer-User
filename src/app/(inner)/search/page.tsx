"use client";
import { LucideSearch } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const searchFunction = async (query: string) => {
  console.log("loading... ", query);
  // const res = await fetch(`/api/search?q=${query}`);
  // const data = await res.json();
};

const SearchPage = () => {
  const params = useSearchParams();
  const ref = useRef<HTMLInputElement>(null);
  const search = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Check if there is a query in the url
  useEffect(() => {
    if (ref.current) {
      const query = search.get("q") || "";
      ref.current.value = query as string;
      ref.current.focus();
      if (query.length > 0) {
        searchFunction(query);
      }
    }
  }, [ref, search]);

  // Handle typing search
  const handleTypingSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchFunction(searchQuery);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const HandleSearch = useCallback(() => {
    const search = `Searching for ${searchQuery} ...`;
    toast.loading(search);
  }, [searchQuery]);

  return (
    <div className="relative p-2 md:p-5">
      <div className="relative overflow-auto mb-8">
        <label className="flex justify-between border dark:border-slate-700 dark:text-white border-gray-400 rounded-md pr-5 overflow-hidden">
          <input
            ref={ref}
            type="search"
            name="Search"
            id="search"
            onChange={handleTypingSearch}
            className="p-4 dark:bg-slate-950  w-full outline-none"
            placeholder="Search"
          />
          <button onClick={HandleSearch}>
            <LucideSearch
              className="self-center pr-2 cursor-pointer"
              size={30}
            />
          </button>
        </label>
      </div>
    </div>
  );
};

export default SearchPage;
