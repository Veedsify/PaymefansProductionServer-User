import UserNotFound from "@/components/common/usernotfound";
import CreateConversationButton from "@/components/sub_components/create-conversation-button";
import CreateSubscriptionButton from "@/components/sub_components/create-subscription-button";
import FollowUserComponent from "@/components/sub_components/followUserComponent";
import ProfileTabsOther from "@/components/sub_components/profile_tabs_other";
import ActiveProfileTag from "@/components/sub_components/sub/active-profile-tag";
import SuspendedUserPage from "@/components/sub_components/suspended";

import { ProfileUserProps } from "@/types/user";
import getUserProfile from "@/utils/data/profile-data";
import getUserData from "@/utils/data/user-data";

import {
    LucideCalendar,
    LucideLink,
    LucideLock,
    LucideMapPin,
    Verified,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { PiCurrencyDollarSimple } from "react-icons/pi";

export const metadata: Metadata = {
    title: "Profile | Paymefans",
    description: "Profile",
};

function formatNumber(num: number = 0): string {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toLocaleString();
}

// Separate avatar+banner, verified badge and bio to subcomponents for clarity
function VerifiedBadge({ type = "user" }: { type?: "user" | "model" }) {
    return (
        <span className="relative group cursor-pointer">
            <Verified stroke={type === "model" ? "purple" : "limegreen"} />
            <span
                className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {type === "model" ? "Model Verified" : "Verified"}
            </span>
        </span>
    );
}

function ProfileCounts({
    followers,
    following,
    subscribers,
    isModel,
}: {
    followers: number;
    following: number;
    subscribers?: number;
    isModel: boolean;
}) {
    return (
        <>
            <div className="flex gap-2 mb-3 flex-wrap sm:text-base text-sm">
                <span className="flex gap-2 items-center">
                    <h1 className="font-bold text-sm">{formatNumber(followers)}</h1>
                    <p className="font-medium text-gray-500 text-sm">Followers</p>
                </span>
                <span className="flex gap-2 items-center">
                    <h1 className="font-bold text-sm">{formatNumber(following)}</h1>
                    <p className="font-medium text-gray-500 text-sm">Following</p>
                </span>
                {isModel && subscribers != null && (
                    <span className="flex gap-2 items-center">
                        <h1 className="font-bold text-sm">{formatNumber(subscribers)}</h1>
                        <p className="font-medium text-gray-500 text-sm">Subscribers</p>
                    </span>
                )}
            </div>
        </>
    );
}

type ParamsProp = Promise<{ id: string }>;
const VERIFIED_USERS = ["@paymefans", "@paymefans1", "@paymefans2"];

const ProfilePage = async ({ params }: { params: ParamsProp }) => {
    const { id } = await params;
    const user = await getUserData();
    const userdata = (await getUserProfile({ user_id: id })) as ProfileUserProps;
    if (!userdata) return <UserNotFound userid={id} />;
    if (user?.id === userdata.id) redirect("/profile");
    if (userdata.active_status === false)
        return <SuspendedUserPage userdata={userdata} />;

    const isVerified = VERIFIED_USERS.includes(userdata.username);
    const canTip = !VERIFIED_USERS.includes(userdata.username);
    return (
        <>
            <div className="overflow-hidden">
                <Image
                    src={userdata.profile_banner || "/site/banner.png"}
                    alt={`Profile banner of ${userdata.name || userdata.username}`}
                    width={700}
                    height={400}
                    priority
                    className="inset-0 aspect-21-9 object-cover w-full h-full"
                />
                {/* Avatar and actions */}
                <div className="relative flex w-full px-2 md:px-5">
                    <Image
                        src={userdata.profile_image || "/site/avatar.png"}
                        alt={`Avatar of ${userdata.name || userdata.username}`}
                        priority
                        height={100}
                        width={100}
                        className="absolute object-cover md:w-24 md:h-24 w-20 h-20 sm:border-4 border-2 rounded-full md:-top-12 -top-6 border-primary-dark-pink"
                    />
                    <div className="flex items-center gap-3 sm:p-3 ml-auto p-3">
                        {canTip && (
                            <button className="cursor-pointer">
                                <PiCurrencyDollarSimple className="w-5 h-5 lg:w-6 lg:h-6 font-bold" />
                            </button>
                        )}
                        <FollowUserComponent profileuser={userdata} />
                        {userdata.is_model && (
                            <CreateSubscriptionButton userdata={userdata} />
                        )}
                        <CreateConversationButton profileId={userdata.user_id} />
                    </div>
                </div>
                {/* Info & bio */}
                <div className="flex flex-col gap-2 px-2 mt-2 mb-12 md:px-5 dark:text-white">
                    {/* Name, badges, and tag */}
                    <div className="flex flex-col">
                        <h1 className="font-bold flex items-center gap-2">
                            {userdata?.name}
                            {isVerified && <VerifiedBadge />}
                            {userdata.is_model && <VerifiedBadge type="model" />}
                            <ActiveProfileTag userid={userdata.username} />
                        </h1>
                        <small className="text-gray-500">{userdata?.username}</small>
                    </div>
                    {/* Bio */}
                    {userdata.bio && (
                        <div
                            className="font-medium mb-2 text-sm leading-loose dark:text-gray-300 text-gray-700"
                            dangerouslySetInnerHTML={{
                                __html: userdata.bio.replace(/(?:\r\n|\r|\n)/g, "<br>"),
                            }}
                        ></div>
                    )}
                    {/* Website */}
                    {userdata.website && (
                        <Link
                            href={userdata.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary-text-dark-pink text-sm mb-2 inline-block"
                        >
                            <LucideLink
                                className="text-primary-text-dark-pink inline-block mr-2"
                                size={18}
                            />
                            {userdata.website}
                        </Link>
                    )}
                    {/* Details */}
                    <div
                        className="flex gap-3 flex-wrap text-sm items-center font-semibold text-gray-700 mb-2 dark:text-white">
                        <span className="flex gap-2 items-center">
                            <LucideMapPin className="text-primary-text-dark-pink" size={18} />
                            <span>Lagos, {userdata.location}</span>
                        </span>
                        {userdata.is_model && (
                            <span className="flex items-center gap-2">
                                <LucideLock className="text-primary-text-dark-pink" size={18} />
                                <span>Model</span>
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <LucideCalendar
                                className="text-primary-text-dark-pink"
                                size={18}
                            />
                            <span>
                                Joined{" "}
                                {userdata.created_at
                                    ? new Date(userdata.created_at).toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })
                                    : ""}
                            </span>
                        </span>
                    </div>
                    {/* Counts */}
                    <ProfileCounts
                        followers={userdata.total_followers}
                        following={userdata.total_following}
                        subscribers={userdata.total_subscribers}
                        isModel={userdata.is_model}
                    />
                </div>
            </div>
            {userdata && userdata.id && (
                <ProfileTabsOther userdata={userdata} />
            )}
        </>
    );
};

export default ProfilePage;
