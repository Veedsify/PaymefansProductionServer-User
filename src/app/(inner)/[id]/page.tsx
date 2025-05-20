"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PiCurrencyDollarSimple } from "react-icons/pi";
import {
    LucideCalendar,
    LucideLink,
    LucideLock,
    LucideMapPin,
    Verified,
} from "lucide-react";

import { useUserAuthContext } from "@/lib/userUseContext";
import { ProfileUserProps } from "@/types/user";
import getUserProfile from "@/utils/data/profile-data";
import UserNotFound from "@/components/common/usernotfound";
import SuspendedUserPage from "@/components/sub_components/suspended";
import FollowUserComponent from "@/components/sub_components/followUserComponent";
import CreateSubscriptionButton from "@/components/sub_components/create-subscription-button";
import CreateConversationButton from "@/components/sub_components/create-conversation-button";
import ProfileTabsOther from "@/components/sub_components/profile_tabs_other";
import ActiveProfileTag from "@/components/sub_components/sub/active-profile-tag";

// Utility to format numbers
const formatNumber = (num: number = 0): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
};

// Verified Badge Component
const VerifiedBadge = ({ type = "user" }: { type?: "user" | "model" }) => (
    <span className="relative group cursor-pointer" aria-label={`${type} verified badge`}>
        <Verified stroke={type === "model" ? "purple" : "limegreen"} size={20} />
        <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {type === "model" ? "Model Verified" : "Verified"}
        </span>
    </span>
);

// Profile Counts Component
const ProfileCounts = ({
    followers,
    following,
    subscribers,
    isModel,
}: {
    followers: number;
    following: number;
    subscribers?: number;
    isModel: boolean;
}) => (
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
);


const ProfilePage = () => {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useUserAuthContext();
    const [userdata, setUserdata] = useState<ProfileUserProps | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const VERIFIED_USERS = ["@paymefans", "@paymefans1", "@paymefans2"];
    const isVerified = userdata?.username ? VERIFIED_USERS.includes(userdata.username) : false;
    const canTip = user?.id !== userdata?.id && user?.is_model && userdata?.is_model;

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) {
                setError("Invalid user ID");
                setLoading(false);
                return;
            }
            try {
                const data = await getUserProfile({ user_id: decodeURIComponent(params.id) });
                setUserdata(data);
            } catch (err) {
                setError("Failed to fetch user profile");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id]);

    useEffect(() => {
        if (userdata && user?.id === userdata.id) {
            router.push("/profile");
        }
    }, [user, userdata, router]);

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (error || !params.id || !userdata) {
        return <UserNotFound userid={params.id || "unknown"} />;
    }

    if (userdata.active_status === false) {
        return <SuspendedUserPage userdata={userdata} />;
    }

    return (
        <Suspense fallback={<div className="text-center py-10">Loading profile...</div>}>
            <div className="overflow-hidden">
                {/* Profile Banner */}
                <Image
                    src={userdata.profile_banner || "/site/banner.png"}
                    alt={`Profile banner of ${userdata.name || userdata.username}`}
                    width={700}
                    height={400}
                    priority
                    className="inset-0 aspect-21-9 object-cover w-full h-full"
                />

                {/* Avatar and Actions */}
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
                            <button
                                aria-label="Tip user"
                                className="cursor-pointer"
                            >
                                <PiCurrencyDollarSimple className="w-5 h-5 lg:w-6 lg:h-6 font-bold" />
                            </button>
                        )}
                        <FollowUserComponent profileuser={userdata} />
                        {userdata.is_model && <CreateSubscriptionButton userdata={userdata} />}
                        <CreateConversationButton profileId={userdata.user_id} />
                    </div>
                </div>

                {/* Info & Bio */}
                <div className="flex flex-col gap-2 px-2 mt-2 mb-12 md:px-5 dark:text-white">
                    {/* Name, Badges, and Tag */}
                    <div className="flex flex-col">
                        <h1 className="font-bold flex items-center gap-2 text-lg">
                            {userdata.name}
                            {isVerified && <VerifiedBadge />}
                            {userdata.is_model && <VerifiedBadge type="model" />}
                            <ActiveProfileTag userid={userdata.username} />
                        </h1>
                        <small className="text-gray-500">{userdata.username}</small>
                    </div>

                    {/* Bio */}
                    {userdata.bio && (
                        <div
                            className="font-medium mb-2 text-sm leading-loose dark:text-gray-300 text-gray-700"
                            dangerouslySetInnerHTML={{
                                __html: userdata.bio.replace(/(?:\r\n|\r|\n)/g, "<br>"),
                            }}
                        />
                    )}

                    {/* Website */}
                    {userdata.website && (
                        <Link
                            href={userdata.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary-text-dark-pink text-sm mb-2 inline-flex items-center"
                        >
                            <LucideLink
                                className="text-primary-text-dark-pink mr-2"
                                size={18}
                                aria-hidden="true"
                            />
                            {userdata.website}
                        </Link>
                    )}

                    {/* Details */}
                    <div className="flex gap-3 flex-wrap text-sm items-center font-semibold text-gray-700 mb-2 dark:text-white">
                        <span className="flex gap-2 items-center">
                            <LucideMapPin className="text-primary-text-dark-pink" size={18} aria-hidden="true" />
                            <span>{userdata.location || "Unknown location"}</span>
                        </span>
                        {userdata.is_model && (
                            <span className="flex items-center gap-2">
                                <LucideLock className="text-primary-text-dark-pink" size={18} aria-hidden="true" />
                                <span>Model</span>
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <LucideCalendar
                                className="text-primary-text-dark-pink"
                                size={18}
                                aria-hidden="true"
                            />
                            <span>
                                Joined{" "}
                                {userdata.created_at
                                    ? new Date(userdata.created_at).toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })
                                    : "Unknown"}
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

                {/* Profile Tabs */}
                {userdata.id && <ProfileTabsOther userdata={userdata} />}
            </div>
        </Suspense>
    );
};

export default ProfilePage;