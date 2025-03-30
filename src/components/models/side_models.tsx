"use client";
import { LucideSearch } from "lucide-react";
import ModelsSubscription from "../sub_components/models_subscription";
import HookupSubscription from "../sub_components/hookup_subscription";
import Link from "next/link";
import { AuthUserProps } from "@/types/user";
import {
  ModelLoader,
  HookUpLoader,
} from "@/components/loaders.tsx/modelloader";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";
import { getToken } from "../../utils/cookie.get";
import { useRouter } from "next/navigation";
import Form from "next/form";
import { useEffect, useState } from "react";
import { socket } from "../sub_components/sub/socket";

const SideModels = () => {
  const [models, setModels] = useState([]);
  const [isLoading, setLoading] = useState(false);
  useEffect(() => {
    const Models = (data: any) => {
      console.log("Models", data);
      setLoading(true);
      if (data?.models) {
        setLoading(false);
        setModels(data.models);
      } else {
        setLoading(true);
      }
    };

    socket.on("models-update", Models);
    return () => {
      socket.off("models-update", Models);
    };
  }, [socket]);

  const {
    isLoading: loadinModels,
    data: data2,
    error: ErrHookup,
  } = useQuery<{ hookups: AuthUserProps[] }>({
    queryKey: ["hookups"],
    queryFn: async () =>
      axiosInstance
        .post(
          `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/models/hookups`,
          {
            limit: 6,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
          }
        )
        .then((res) => {
          return res.data;
        }),
  });

  const router = useRouter();

  return (
    <div className="p-4 lg:block hidden lg:col-span-3 dark:text-white">
      <div className="max-w-[450px]">
        <Form action={"/search"} className="relative overflow-auto mb-8">
          <label className="flex justify-between border dark:border-slate-700 dark:text-white border-gray-400 rounded-md pr-5 overflow-hidden">
            <input
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  router.push(`/search?q=${e.currentTarget.value}`);
                  e.currentTarget.value = "";
                }
              }}
              type="search"
              name="q"
              id="search"
              className="p-4 dark:bg-slate-950  w-full outline-none"
              placeholder="Search"
            />
            <button>
              <LucideSearch
                className="self-center pr-2 cursor-pointer"
                size={30}
              />
            </button>
          </label>
        </Form>

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
            {(models.length === 0 && !isLoading) && (
              <div className="text-center text-gray-700">No Models Found</div>
            )}
            {isLoading && <ModelLoader />}
            <div className="grid grid-cols-3 gap-3">
              {models &&
                models?.map((model: any) => {
                  return (
                    <ModelsSubscription model={model} key={model?.username} />
                  );
                })}
            </div>
          </div>
        </div>
        <hr className="dark:border-slate-800 border-black/30" />
        <div className="flex align-middle justify-between  my-8">
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
        {data2?.hookups?.length === 0 && (
          <div className="text-center text-gray-700">No Hookup Available</div>
        )}
        {loadinModels && <HookUpLoader />}
        <div className="grid gap-4 lg:gap-6 grid-cols-3 ">
          {data2?.hookups &&
            data2?.hookups?.map((hookup: AuthUserProps) => {
              return (
                <HookupSubscription hookup={hookup} key={hookup?.username} />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SideModels;
