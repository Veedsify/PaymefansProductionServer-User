"use client";
import { LucideSearch } from "lucide-react";
import ModelsSubscription from "../sub_components/ModelsSubscription";
import HookupSubscription from "../sub_components/HookupSubscription";
import Link from "next/link";
import {
  ModelLoader,
  HookUpLoader,
} from "@/components/loaders.tsx/ModelLoader";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getSocket } from "../sub_components/sub/Socket";
import { shuffle, uniqBy } from "lodash";

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

const SideModels = () => {
  const [models, setModels] = useState<any[]>([]);
  const [hookups, setHookups] = useState<any[]>([]);
  const [isHookupLoading, setHookupLoading] = useState(true);
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();
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

  const Models = (data: any) => {
    setLoading(false);
    if (data?.models) {
      // Using lodash to shuffle the models array
      setModels(shuffle(data.models));
    }
  };

  const Hookups = (data: any) => {
    setHookupLoading(false);
    if (data?.hookups) {
      setHookups(shuffle(uniqBy(data.hookups, "username")));
    }
  };

  useEffect(() => {
    // Send location when component mounts
    sendUserLocation();
    update();

    // Set up interval to periodically update location-based hookups
    const locationInterval = setInterval(sendUserLocation, 5 * 60 * 1000); // Every 5 minutes
    // Set up interval to periodically update location-based hookups and models
    const updateIntervals = setInterval(update, 1 * 60 * 1000);

    // Listen for socket events
    socket.on("models-update", Models);
    socket.on("hookup-update", Hookups);

    return () => {
      socket.off("models-update", Models);
      socket.off("hookup-update", Hookups);
      clearInterval(updateIntervals);
      clearInterval(locationInterval);
    };
  }, [socket, sendUserLocation, update]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      router.push(`/search?q=${e.currentTarget.value}`);
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="p-4 lg:block hidden lg:col-span-3 dark:text-white">
      <div className="max-w-[450px]">
        <div className="relative overflow-auto mb-8">
          <label className="flex justify-between border dark:border-slate-700 dark:text-white border-black/40 rounded-md pr-5 overflow-hidden">
            <input
              onKeyDown={handleSearchKeyDown}
              type="search"
              name="q"
              id="search"
              className="p-4 dark:bg-black w-full border-black/40 outline-none"
              placeholder="Search Paymefans"
            />
            <button>
              <LucideSearch
                className="self-center pr-2 cursor-pointer"
                size={30}
              />
            </button>
          </label>
        </div>

        <div>
          <div className="flex align-middle justify-between pb-6 dark:text-white">
            <span className="font-bold">Models/Creators</span>
            <span>
              <Link
                href="/models"
                className="bg-primary-dark-pink text-white px-3 text-sm py-1 font-semibold rounded-md"
              >
                View All
              </Link>
            </span>
          </div>
          <div className="py-6 mb-6">
            {models.length === 0 && !isLoading && (
              <div className="text-center text-gray-700">No Models Found</div>
            )}
            {isLoading ? (
              <ModelLoader />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {models.map(
                  (model: any, index: number) =>
                    models && <ModelsSubscription model={model} key={index} />,
                )}
              </div>
            )}
          </div>
        </div>

        <hr className="dark:border-slate-800 border-black/40" />

        <div className="flex align-middle justify-between my-8">
          <span className="font-bold">Hookup</span>
          <span>
            <Link
              href="/hookup"
              className="bg-primary-dark-pink text-white px-3 text-sm py-1 font-semibold rounded-md"
            >
              View All
            </Link>
          </span>
        </div>

        {hookups.length === 0 && !isHookupLoading && (
          <div className="text-center text-gray-700">No Hookup Available</div>
        )}
        {isHookupLoading ? (
          <HookUpLoader />
        ) : (
          <div className="grid gap-4 lg:gap-6 grid-cols-3">
            {hookups.map((hookup: HookupProps, index: number) => (
              <HookupSubscription hookup={hookup} key={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideModels;
