"use client";
import { LucideSearch } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HookUpLoader,
  ModelLoader,
} from "@/components/common/loaders/ModelLoader";
import { useAuthContext } from "@/contexts/UserUseContext";
import { useModelsAndHookups } from "@/hooks/queries/useModelsAndHookups";
import HookupSubscription from "./HookupSubscription";
import ModelsSubscription from "./ModelsSubscription";

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

const SideModels = () => {
  const router = useRouter();
  const { isGuest } = useAuthContext();

  // Use the custom hook for models and hookups
  const { data, isLoading, error, refetch } = useModelsAndHookups({
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    enabled: !isGuest,
  });

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      router.push(`/search?q=${e.currentTarget.value}`);
      e.currentTarget.value = "";
    }
  };

  const { models, hookups } = data;

  if (error) {
    console.error("Error fetching models and hookups:", error);
  }

  if (isGuest) {
    return <div className="hidden lg:block lg:col-span-3" />;
  }

  return (
    <div className="hidden p-4 lg:block lg:col-span-3 dark:text-white">
      <div className="max-w-[450px]">
        <div className="relative mb-8 overflow-auto">
          <label className="flex justify-between pr-5 overflow-hidden border dark:border-slate-700 dark:text-white border-black/20 rounded-md">
            <input
              onKeyDown={handleSearchKeyDown}
              type="search"
              name="q"
              id="search"
              className="w-full p-4 outline-none dark:bg-black border-black/20"
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
          <div className="flex justify-between pb-6 align-middle dark:text-white">
            <span className="font-bold">Models/Creators</span>
            <span>
              <Link
                href="/models"
                className="px-3 py-1 text-sm font-semibold text-white bg-primary-dark-pink rounded-md"
              >
                View All
              </Link>
            </span>
          </div>
          <div className="py-6 mb-6">
            {isLoading ? (
              <ModelLoader />
            ) : models.length === 0 ? (
              <div className="text-center text-gray-700">
                <div className="mb-3">
                  {error ? "Failed to load models" : "No Models Found"}
                </div>
                {error && (
                  <button
                    onClick={() => refetch()}
                    className="px-3 py-1 text-sm text-white bg-primary-dark-pink rounded-md hover:opacity-80"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {models.map((model: any, index: number) => (
                  <ModelsSubscription
                    model={model}
                    key={`model-${model.id || index}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <hr className="dark:border-slate-800 border-black/20" />

        <div className="flex justify-between my-8 align-middle">
          <span className="font-bold">Hookup</span>
          <span>
            <Link
              href="/hookup"
              className="px-3 py-1 text-sm font-semibold text-white bg-primary-dark-pink rounded-md"
            >
              View All
            </Link>
          </span>
        </div>

        {isLoading ? (
          <HookUpLoader />
        ) : hookups.length === 0 ? (
          <div className="text-center text-gray-700">
            <div className="mb-3">
              {error ? "Failed to load hookups" : "No Hookup Available"}
            </div>
            {error && (
              <button
                onClick={() => refetch()}
                className="px-3 py-1 text-sm text-white bg-primary-dark-pink rounded-md hover:opacity-80"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 lg:gap-6 grid-cols-3">
            {hookups.map((hookup: HookupProps, index: number) => (
              <HookupSubscription
                hookup={hookup}
                key={`hookup-${hookup.id || index}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideModels;
