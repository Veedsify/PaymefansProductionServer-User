"use client";
import { LucideArrowDown, LucideLoader, LucideSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { HookUpLoader } from "@/components/common/loaders/ModelLoader";
import HookupSubscription from "@/features/models/comps/HookupSubscription";
import { useHookups } from "@/hooks/queries/useHookups";

export interface HookupProps {
  distance?: number; // Distance in km (optional)
  price_per_message: number;
  name: string;
  hookup: boolean;
  id: number;
  is_model: boolean;
  profile_banner: string;
  profile_image: string;
  subscription_price: number;
  username: string;
  state?: string;
  location?: string;
  user_city?: string;
  user_state?: string;
  gender: string;
}

const HookupPage = () => {
  const [filteredHookups, setFilteredHookups] = useState<HookupProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch hookups using dedicated hook
  const { hookups, isLoading, error, refetch } = useHookups({
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Filter hookups based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredHookups(hookups);
    } else {
      const filtered = hookups.filter(
        (hookup) =>
          hookup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hookup.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hookup.user_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hookup.user_state
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          hookup.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hookup.state?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredHookups(filtered);
    }
  }, [searchQuery, hookups]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  if (error) {
    console.error("Error fetching hookups:", error);
  }

  return (
    <div className="block p-4 md:p-4">
      <div className="flex items-center mb-7 lg:hidden">
        <span className="flex-shrink-0 text-xl font-bold">Hookup</span>
      </div>

      <div className="relative overflow-auto">
        <label className="flex justify-between pr-5 overflow-hidden border border-gray-400 rounded-md">
          <input
            type="search"
            name="Search"
            id="search"
            className="w-full p-4 outline-none"
            placeholder="Search by name, username, or location"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
          />
          <LucideSearch className="self-center pr-2 cursor-pointer" size={30} />
        </label>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-4 py-4 text-sm text-gray-600">
          {filteredHookups.length} result
          {filteredHookups.length !== 1 ? "s" : ""} found for &apos;
          {searchQuery}&apos;
        </div>
      )}

      <div className="py-3">
        {isLoading ? (
          <HookUpLoader />
        ) : filteredHookups.length === 0 ? (
          <div className="py-12 text-center text-gray-700">
            <div className="mb-4">
              {error
                ? "Failed to load hookups"
                : searchQuery
                  ? `No hookups found matching "${searchQuery}"`
                  : "No hookups available"}
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
          <div className="justify-between grid md:grid-cols-4 grid-cols-3 gap-4 lg:gap-6">
            {filteredHookups.map((hookup: HookupProps, index: number) => (
              <HookupSubscription
                hookup={hookup}
                key={`${hookup.id}-${index}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HookupPage;
