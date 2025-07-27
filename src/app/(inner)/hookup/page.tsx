"use client";
import HookupSubscription from "@/components/sub_components/HookupSubscription";
import { LucideArrowDown, LucideSearch } from "lucide-react";
import { Metadata } from "next";
import { useCallback, useEffect, useState } from "react";
import { getSocket } from "@/components/sub_components/sub/Socket";
import { shuffle, uniqBy } from "lodash";
import { HookUpLoader } from "@/components/loaders.tsx/ModelLoader";

export interface HookupProps {
  distance?: number; // Distance in km (optional)
  price_per_message: number;
  fullname: string;
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
  const [hookups, setHookups] = useState<HookupProps[]>([]);
  const [filteredHookups, setFilteredHookups] = useState<HookupProps[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const socket = getSocket();

  // Send user location if available
  const sendUserLocation = useCallback(() => {
    try {
      const storedLocation = localStorage.getItem("userLocation");
      if (storedLocation) {
        const locationData = JSON.parse(storedLocation);

        // Only use location data if it's recent (less than 30 minutes old)
        const isRecent = Date.now() - locationData.timestamp < 30 * 60 * 1000;

        if (isRecent && locationData.consentGiven) {
          // Emit location to server for better hookup matching
          socket.emit("user-location", {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          });
        }
      }
    } catch (error) {
      console.error("Error sending location data:", error);
    }
  }, [socket]);

  const update = useCallback(() => {
    socket.emit("pool-models-and-hookup");
  }, [socket]);

  const Hookups = (data: any) => {
    setLoading(false);
    if (data?.hookups) {
      const shuffledHookups = shuffle(uniqBy(data.hookups, "username"));
      setHookups(shuffledHookups);
      setFilteredHookups(shuffledHookups);
    }
  };

  // Filter hookups based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredHookups(hookups);
    } else {
      const filtered = hookups.filter(
        (hookup) =>
          hookup.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  useEffect(() => {
    // Send location when component mounts
    sendUserLocation();
    update();

    // Set up interval to periodically update location-based hookups
    const locationInterval = setInterval(sendUserLocation, 5 * 60 * 1000); // Every 5 minutes
    // Set up interval to periodically update hookups
    const updateInterval = setInterval(update, 1 * 60 * 1000); // Every minute

    // Listen for socket events
    socket.on("hookup-update", Hookups);

    return () => {
      socket.off("hookup-update", Hookups);
      clearInterval(updateInterval);
      clearInterval(locationInterval);
    };
  }, [socket, sendUserLocation, update]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Optional: You can add additional search functionality here
    if (e.key === "Enter") {
      // Search is already handled by the useEffect above
      e.preventDefault();
    }
  };

  return (
    <div className="block p-4 md:p-8">
      <div className="flex items-center mb-7 lg:hidden">
        <span className="font-bold text-xl flex-shrink-0">Hookup</span>
      </div>
      <div className="relative overflow-auto pb-7">
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
        <div className="mb-4 text-sm text-gray-600">
          {filteredHookups.length} result
          {filteredHookups.length !== 1 ? "s" : ""} found for "{searchQuery}"
        </div>
      )}

      <div className="py-6">
        {filteredHookups.length === 0 && !isLoading && (
          <div className="text-center text-gray-700 py-12">
            {searchQuery
              ? `No hookups found matching "${searchQuery}"`
              : "No hookups available"}
          </div>
        )}

        {isLoading ? (
          <HookUpLoader />
        ) : (
          <div className="grid md:grid-cols-4 grid-cols-3 gap-4 lg:gap-6 justify-between">
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
