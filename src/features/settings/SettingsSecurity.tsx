"use client";
import {
    LucideChevronRight,
    LucideUserMinus2,
    LucideUsers,
} from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/UserUseContext";
import Toggle from "../../components/common/toggles/Checked";
import UpdatePasswords from "../user/comps/UpdatePassword";
import DeleteAccount from "./DeleteAccount";
import SettingsHookupCheck from "./SettingsHookupCheck";
import TwoFactorAuth from "./SettingsTwoFactorAuth";
import EnableAndDisableWaterMark from "./components/watermark/EnableAndDisableWaterMark";

const SettingsSecurity = () => {
    const { user } = useAuthContext();
    return (
        <div className="bg-white  dark:bg-gray-950 rounded-xl transition-colors duration-300">
            <h1 className="mb-6 text-lg font-bold text-gray-900 md:text-xl dark:text-gray-100">
                Privacy
            </h1>
            <div className="space-y-3">
                <Link
                    className="flex items-center px-6 py-4 border border-gray-200 rounded-lg cursor-pointer gap-4 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                    href="/settings/followers"
                >
                    <span>
                        <LucideUsers className="text-gray-700 dark:text-gray-200 group-hover:text-primary-dark-pink transition-colors" />
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                        All Followers
                    </span>
                    <span className="ml-auto">
                        <LucideChevronRight className="text-gray-400 dark:text-gray-500" />
                    </span>
                </Link>
                {user && user.is_model && (
                    <Link
                        className="flex items-center px-6 py-4 border border-green-500 rounded-lg cursor-pointer gap-4 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900 transition-all duration-200 group"
                        href="/settings/subscribers"
                    >
                        <span>
                            <LucideUsers className="text-green-600 dark:text-green-400 group-hover:text-green-700" />
                        </span>
                        <span className="font-semibold text-green-700 dark:text-green-400">
                            Active Subscribers
                        </span>
                        <span className="ml-auto">
                            <LucideChevronRight className="text-green-400 dark:text-green-500" />
                        </span>
                    </Link>
                )}

                <Link
                    href="/settings/blocked"
                    className="flex items-center px-6 py-4 text-red-600 border border-red-300 rounded-lg cursor-pointer gap-4 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-200 dark:text-red-400 group"
                >
                    <span>
                        <LucideUserMinus2 className="group-hover:text-red-700" />
                    </span>
                    <span className="font-semibold">Blocked Users</span>
                    <span className="ml-auto">
                        <LucideChevronRight className="text-red-400 dark:text-red-500" />
                    </span>
                </Link>
            </div>

            <div className="mt-10">
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                    Change Password
                </h2>
                <UpdatePasswords />
            </div>

            <div className="mt-8">
                <SettingsHookupCheck />
            </div>

            <div className="mt-8">
                <TwoFactorAuth />
            </div>

            <div className="mt-8">
                <EnableAndDisableWaterMark />
            </div>

            <div className="mt-10">
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                    Change Email / Phone
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                    To change your account email, please visit the help section
                    or contact support:&nbsp;
                    <a
                        className="underline text-primary-dark-pink hover:text-primary-pink dark:text-primary-dark-pink"
                        href="mailto:support@paymefans.com"
                    >
                        support@paymefans.com
                    </a>
                </p>
            </div>

            <DeleteAccount />
        </div>
    );
};

export default SettingsSecurity;
