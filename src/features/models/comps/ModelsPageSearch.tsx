"use client";
import {
  LucideArrowDown,
  LucideArrowUp,
  LucideLoader,
  LucideSearch,
} from "lucide-react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { useModels } from "@/hooks/queries/useModels";
import ModelsSubscription from "./ModelsSubscription";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

const useDebounce = (callback: (value: string) => void, delay: number) => {
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (value: string) => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
      const newTimer = setTimeout(() => {
        callback(value);
      }, delay);
      setTypingTimer(newTimer);
    },
    [callback, delay, typingTimer],
  );

  return debouncedCallback;
};

export default function ModelsPageSearch() {
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Fetch models using TanStack Query
  const { models, isLoading, error, refetch } = useModels({
    search: debouncedSearch,
    limit: 50,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: debouncedSearch ? undefined : 5 * 60 * 1000, // Don't auto-refetch during search
  });

  const handleSearch = useDebounce((value: string) => {
    setDebouncedSearch(value);
  }, 1000);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    handleSearch(value);
  };

  return (
    <>
      <div className="relative overflow-auto pb-7 dark:text-white">
        <label className="flex justify-between pr-5 overflow-hidden border border-gray-400 rounded-md">
          <input
            onChange={handleInputChange}
            value={search}
            type="search"
            name="Search"
            id="search"
            className="w-full p-4 outline-none dark:bg-gray-950"
            placeholder="Search models by name or username"
          />
          <LucideSearch className="self-center pr-2 cursor-pointer" size={30} />
        </label>
      </div>

      {/* Search Results Info */}
      {debouncedSearch && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {models.length} result{models.length !== 1 ? "s" : ""} found for
          &apos;
          {debouncedSearch}&apos;
        </div>
      )}

      <div className={`${models.length > 0 && "py-6"}`}>
        {isLoading ? (
          <LoadingSpinner />
        ) : models.length === 0 ? (
          <div className="py-12 text-center text-gray-700 dark:text-gray-300">
            <div className="mb-4">
              {error
                ? "Failed to load models"
                : debouncedSearch
                  ? `No models found matching "${debouncedSearch}"`
                  : "No models found"}
            </div>
            {error && (
              <button
                onClick={() => refetch()}
                className="px-4 py-2 text-sm text-white bg-primary-dark-pink rounded-md hover:opacity-80"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {models.map((model, index) => (
              <ModelsSubscription
                model={model}
                key={`model-${model.id || index}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
