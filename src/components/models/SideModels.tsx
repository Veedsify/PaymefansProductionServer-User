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
import { useModelsAndHookups } from "@/hooks/queries/useModelsAndHookups";

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
  const router = useRouter();

  // Use the custom hook for models and hookups
  const { data, isLoading, error, isEmpty, hasLoadedData, refetch } =
    useModelsAndHookups({
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 5 * 60 * 1000, // 5 minutes
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
                    className="bg-primary-dark-pink text-white px-3 py-1 text-sm rounded-md hover:opacity-80"
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
                className="bg-primary-dark-pink text-white px-3 py-1 text-sm rounded-md hover:opacity-80"
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
