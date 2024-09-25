"use client"
import { LucideArrowDown, LucideArrowUp, LucideLoader, LucideSearch } from "lucide-react"
import ModelsFetch from "../custom-hooks/model-fetch"
import { ChangeEvent, useCallback, useState } from "react"
import ModelsSubscription from "../sub_components/models_subscription"

const useDebounce = (callback: (value: string) => void, delay: number) => {
    const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

    const debouncedCallback = useCallback((value: string) => {
        if (typingTimer) {
            clearTimeout(typingTimer);
        }
        const newTimer = setTimeout(() => {
            callback(value);
        }, delay);
        setTypingTimer(newTimer);
    }, [callback, delay, typingTimer]);

    return debouncedCallback;
};

export default function ModelsPageSearch() {
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [search, setSearch] = useState<string>("")

    const {
        loading,
        models,
        error
    } = ModelsFetch(pageNumber, search)

    const handleSearch = useDebounce((value: string) => {
        setSearch(value);
        setPageNumber(1);
    }, 500);

    return (
        <>
            <h1 className="font-bold text-xl mb-5 flex items-center gap-1">
                Search for Models/Creators <LucideArrowDown />
            </h1>
            <div className="relative overflow-auto pb-7 dark:text-white">
                <label className="flex justify-between pr-5 overflow-hidden border border-gray-400 rounded-md">
                    <input
                        onChange={e => handleSearch(e.target.value)}
                        type="search" name="Search" id="search" className="w-full p-4 outline-none  dark:bg-gray-950 " placeholder="Search" />
                    <LucideSearch className="self-center pr-2 cursor-pointer" size={30} />
                </label>
            </div>
            <div className="py-6">
                <div className="grid grid-cols-3 gap-4 lg:gap-6">
                    {models.map((model, index) => (
                        <ModelsSubscription model={model} key={index} />
                    ))}
                </div>
            </div>
            <div>
                {(loading && !error) && (
                    <div className="flex justify-center">
                        <LucideLoader size={30} className="animate-spin" />
                    </div>
                )}
            </div>
            <div>
                {(models.length < 1 && !loading) && (
                    <div className="text-center">
                        <h1>No Models/Creators found</h1>
                    </div>
                )}
            </div>
        </>
    )
}