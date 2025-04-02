"use client";
import {LucideSearch} from "lucide-react";
import ModelsSubscription from "../sub_components/models_subscription";
import HookupSubscription from "../sub_components/hookup_subscription";
import Link from "next/link";
import {AuthUserProps} from "@/types/user";
import {ModelLoader, HookUpLoader} from "@/components/loaders.tsx/modelloader";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {socket} from "../sub_components/sub/socket";
import {shuffle} from 'lodash';

const SideModels = () => {
    const [models, setModels] = useState<any[]>([]);
    const [hookups, setHookups] = useState<any[]>([]);
    const [isHookupLoading, setHookupLoading] = useState(true);
    const [isLoading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const Models = (data: any) => {
            setLoading(false);
            console.log("Models", data);
            if (data?.models) {
                // Using lodash to shuffle the models array
                setModels(shuffle(data.models));
            }
        };

        const Hookups = (data: any) => {
            setHookupLoading(false);
            console.log("Hookups", data);
            if (data?.hookups) {
                setHookups(shuffle(data.hookups));
            }
        };

        socket.on("models-update", Models);
        socket.on("hookup-update", Hookups);

        return () => {
            socket.off("models-update", Models);
            socket.off("hookup-update", Hookups);
        };
    }, []);

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
                    <label
                        className="flex justify-between border dark:border-slate-700 dark:text-white border-gray-400 rounded-md pr-5 overflow-hidden">
                        <input
                            onKeyDown={handleSearchKeyDown}
                            type="search"
                            name="q"
                            id="search"
                            className="p-4 dark:bg-slate-950 w-full outline-none"
                            placeholder="Search"
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
                        {isLoading ? <ModelLoader/> : (
                            <div className="grid grid-cols-3 gap-3">
                                {models.map((model: any, index: number) => (
                                    models && <ModelsSubscription model={model} key={index}/>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <hr className="dark:border-slate-800 border-black/30"/>

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
                {isHookupLoading ? <HookUpLoader/> : (
                    <div className="grid gap-4 lg:gap-6 grid-cols-3">
                        {hookups.map((hookup: AuthUserProps, index: number) => (
                            <HookupSubscription hookup={hookup} key={index}/>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SideModels;
