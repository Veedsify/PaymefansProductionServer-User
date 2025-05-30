import HookupSubscription from "@/components/sub_components/HookupSubscription";
import { LucideArrowDown, LucideSearch } from "lucide-react";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Hookup",
    description: "Profile page",
}
const HookupPage = () => {
    return (
        <div className="block p-4 md:p-8">
            <div className="flex items-center mb-7 lg:hidden">
                <span className="font-bold text-xl flex-shrink-0 ">Hookup</span>
            </div>
            <div className="relative overflow-auto pb-7">
                <label className="flex justify-between pr-5 overflow-hidden border border-gray-400 rounded-md">
                    <input type="search" name="Search" id="search" className="w-full p-4 outline-none" placeholder="Search" />
                    <LucideSearch className="self-center pr-2 cursor-pointer" size={30} />
                </label>
            </div>
            <div className="py-6">
                <div className="grid md:grid-cols-4 grid-cols-3 gap-4 lg:gap-6 justify-between">
                    {/* INSERT RETURNED RESULTS HERE */}
                    {/* <HookupSubscription />
                    <HookupSubscription />
                    <HookupSubscription />
                    <HookupSubscription /> */}
                </div>
            </div>
        </div>
    );
}

export default HookupPage;
