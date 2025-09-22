"use client";

import {
  LucideCalendar,
  LucideLink,
  LucideLock,
  LucideMapPin,
  Verified,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PiCurrencyDollarSimple } from "react-icons/pi";
import { useGuestModal } from "@/contexts/GuestModalContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import CreateConversationButton from "@/features/chats/comps/CreateConversationButton";
import FollowUserComponent from "@/features/follow/FollowUserComponent";
import TipModel from "@/features/models/comps/TipModel";
import ActiveProfileTag from "@/features/profile/ActiveProfileTag";
import MoreProfileOptions from "@/features/profile/MoreProfileOptions";
import ProfileSocialLinks from "@/features/profile/ProfileSocialLinks";
import ProfileTabsOther from "@/features/profile/ProfileTabsOther";
import SuspendedUserPage from "@/features/profile/Suspended";
import CreateSubscriptionButton from "@/features/subscriptions/CreateSubscriptionButton";
// import { ProfileUserProps } from "@/features/user/types/user"; // Removed unused import
import UserNotFound from "@/features/user/comps/UserNotFound";
import { useProfile } from "@/hooks/queries/useProfile";
import FormatName from "@/lib/FormatName";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

// Utility to format numbers
const formatNumber = (num: number = 0): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
};
// Verified Badge Component
const VerifiedBadge = ({ type = "user" }: { type?: "user" | "model" }) => (
  <span
    className="relative cursor-pointer group"
    aria-label={`${type} verified badge`}
  >
    <Verified stroke={type === "model" ? "purple" : "limegreen"} size={20} />
    <span className="absolute z-10 px-2 py-1 mt-2 text-xs text-white bg-black rounded opacity-0 left-1/2 -translate-x-1/2 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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
  <div className="flex flex-wrap mb-3 text-sm gap-2 sm:text-base">
    <span className="flex items-center gap-2">
      <h1 className="text-sm font-bold">{formatNumber(followers)}</h1>
      <p className="text-sm font-medium text-gray-500">Followers</p>
    </span>
    <span className="flex items-center gap-2">
      <h1 className="text-sm font-bold">{formatNumber(following)}</h1>
      <p className="text-sm font-medium text-gray-500">Following</p>
    </span>
    {isModel && typeof subscribers === "number" && subscribers > 0 && (
      <span className="flex items-center gap-2">
        <h1 className="text-sm font-bold">{formatNumber(subscribers)}</h1>
        <p className="text-sm font-medium text-gray-500">Subscribers</p>
      </span>
    )}
  </div>
);
const ProfilePage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isGuest } = useAuthContext();
  const { toggleModalOpen } = useGuestModal();
  const [openTip, setOpenTip] = useState(false);
  // Use TanStack Query to fetch profile data
  const {
    data: profileData,
    isLoading,
    error,
  } = useProfile({
    userId: params.id || "",
    viewerId: user?.id || null,
    enabled: !!params.id,
  });

  const userdata = profileData?.user;
  const isBlockedByUser = profileData?.isBlockedByUser;
  const isVerified = userdata?.is_verified;
  const canTip = user?.id !== userdata?.id && !userdata?.is_model;

  // Handle redirects and navigation in a single useEffect
  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // Handle errors
    if (error) {
      if (isGuest) {
        router.push("/login");
      } else {
        notFound();
      }
      return;
    }

    // Handle successful data load
    if (userdata) {
      // Redirect to own profile page if viewing own profile
      if (userdata.id && user?.id === userdata.id && !isGuest) {
        router.push("/profile");
        return;
      }

      // Redirect to correct username URL if needed
      if (userdata.username !== params.id && user?.id !== userdata.id) {
        router.replace(`/${userdata.username}`);
        return;
      }
    }
  }, [error, isLoading, userdata, user, isGuest, router, params.id]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingSpinner text="Loading Profile" />
      </div>
    );
  }

  // Handle error states
  if (error) {
    return <UserNotFound userid={params.id || "unknown"} />;
  }

  // Handle no user data
  if (!userdata && !isLoading) {
    return <UserNotFound userid={params.id || "unknown"} />;
  }

  // Don't render if viewing own profile (will redirect)
  if (user?.id === userdata?.id) {
    return null;
  }

  // Handle suspended user
  if (userdata && !userdata?.active_status) {
    return <SuspendedUserPage userdata={userdata} />;
  }

  // Handle blocked user
  if (isBlockedByUser) {
    return <UserNotFound userid={params.id || "unknown"} />;
  }
  const toggleTip = () => {
    if (!isGuest) {
      setOpenTip(!openTip);
      return;
    }
    toggleModalOpen(
      `You need to login to tip ${userdata?.name || "this user"}.`,
    );
  };
  // Additional safety check
  if (!userdata) {
    return <UserNotFound userid={params.id || "unknown"} />;
  }

  return (
    <div className="overflow-hidden">
      {/* Profile Banner */}
      <Image
        src={userdata.profile_banner || "/site/banner.png"}
        alt={`Profile banner of ${userdata.name || userdata.username}`}
        width={700}
        height={400}
        priority
        className="inset-0 object-cover w-full h-full aspect-21-9"
      />
      {/* Avatar and Actions */}
      <div className="relative flex w-full px-2 md:px-5">
        <Image
          src={userdata.profile_image || "/site/avatar.png"}
          alt={`Avatar of ${userdata.name || userdata.username}`}
          priority
          height={100}
          width={100}
          className="absolute object-cover w-20 h-20 border-2 rounded-full md:w-24 md:h-24 sm:border-4 md:-top-12 -top-6 border-primary-dark-pink"
        />
        <div className="flex items-center py-3 ml-auto gap-3 sm:p-3">
          {canTip && (
            <button
              onClick={toggleTip}
              aria-label="Tip user"
              className="cursor-pointer"
            >
              <PiCurrencyDollarSimple className="w-5 h-5 font-bold lg:w-6 lg:h-6" />
            </button>
          )}
          <FollowUserComponent profileuser={userdata} />
          {userdata.is_model && user?.id !== userdata.id && (
            <CreateSubscriptionButton userdata={userdata} />
          )}
          <CreateConversationButton profileId={userdata.user_id} />
          {!isGuest && (
            <MoreProfileOptions user={userdata} authUserId={Number(user?.id)} />
          )}
        </div>
      </div>
      {/* Info & Bio */}
      <div className="flex flex-col px-2 mt-2 mb-6 gap-2 md:px-5 dark:text-white">
        {/* Name, Badges, and Tag */}
        <div className="flex flex-col">
          <h1 className="flex items-center text-lg font-bold gap-2">
            {FormatName(userdata.name)}
            {isVerified && <VerifiedBadge />}
            {userdata.is_model && <VerifiedBadge type="model" />}
            {!isGuest && <ActiveProfileTag userid={userdata.username} />}
          </h1>
          <small className="text-gray-500">{userdata.username}</small>
        </div>
        {/* Bio */}
        {userdata.bio && (
          <div
            className="mb-2 text-sm font-medium leading-loose text-gray-700 dark:text-gray-300"
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
            className="inline-flex items-center mb-2 text-sm font-medium text-primary-text-dark-pink"
          >
            <LucideLink
              className="mr-2 text-primary-text-dark-pink"
              size={18}
              aria-hidden="true"
            />
            {userdata.website}
          </Link>
        )}
        {/* Details */}
        <div className="flex flex-wrap items-center mb-2 text-sm font-semibold text-gray-700 gap-3 dark:text-white">
          <span className="flex items-center gap-2">
            <LucideMapPin
              className="text-primary-text-dark-pink"
              size={18}
              aria-hidden="true"
            />
            <span>{userdata.location || "Unknown location"}</span>
          </span>
          {userdata.is_model && (
            <span className="flex items-center gap-2">
              <LucideLock
                className="text-primary-text-dark-pink"
                size={18}
                aria-hidden="true"
              />
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
              {userdata.created_at &&
              !Number.isNaN(new Date(userdata.created_at).getTime())
                ? new Date(userdata.created_at).toLocaleString("en-US", {
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
        <ProfileSocialLinks Settings={userdata?.Settings} />
      </div>{" "}
      {/* Profile Tabs */}
      {userdata.id && openTip && (
        <TipModel userdata={userdata} close={toggleTip} />
      )}
      <ProfileTabsOther userdata={userdata} />
    </div>
  );
};
export default ProfilePage;
