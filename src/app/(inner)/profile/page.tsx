"use client";
import { useQuery } from "@tanstack/react-query";
import {
  LucideCalendar,
  LucideLink,
  LucideLock,
  LucideMapPin,
} from "lucide-react";
import Link from "next/link";
import CreatorDashboardButton from "@/features/profile/CreatorDashboardButton";
import EditProfileButton from "@/features/profile/EditProfileButton";
import MoreProfileOptions from "@/features/profile/MoreProfileOptions";
import ProfileBanner from "@/features/profile/ProfileBanner";
import { ProfileCounts } from "@/features/profile/ProfileCount";
import ProfilePicture from "@/features/profile/ProfilePicture";
import ProfileSocialLinks from "@/features/profile/ProfileSocialLinks";
import ProfileTabs from "@/features/profile/ProfileTabs";
import type { AuthUserProps } from "@/features/user/types/user";
import getUserData from "@/utils/data/UserData";
import FormatName from "@/lib/FormatName";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import ErrorComponent from "@/components/common/loaders/ErrorComponent";

const ProfilePage = () => {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfileData"],
    queryFn: getUserData,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent text="Error loading user data" />;
  if (!user) return <ErrorComponent text="No UserData Found" />;

  return (
    <>
      <div className="overflow-hidden">
        <div className="relative">
          <ProfileBanner user={user} />
        </div>

        <div className="relative flex w-full px-2 md:px-5">
          <ProfilePicture user={user} />
          <div className="flex items-center py-3 ml-auto gap-3 sm:p-3">
            <EditProfileButton user={user} />
            <MoreProfileOptions
              user={user as AuthUserProps}
              authUserId={Number(user?.id)}
            />
          </div>
        </div>

        <div className="flex flex-col items-start px-2 mt-2 mb-6 gap-2 md:px-5">
          <div className="flex flex-col">
            <h1 className="font-bold text-gray-900 dark:text-gray-100">
              {user?.name ? FormatName(user.name) : ""}
            </h1>
            <small className="text-gray-500 dark:text-gray-400">
              {user?.username}
            </small>
          </div>

          <div
            className="mb-2 font-medium leading-loose text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{
              __html: user?.bio
                ? user?.bio?.replace(/(?:\r\n|\r|\n)/g, "<br>")
                : "",
            }}
          />

          {user?.website && (
            <Link
              href={user.website ? user.website : ""}
              target="_blank"
              className="inline-block mb-2 text-sm font-medium text-primary-text-dark-pink dark:text-primary-dark-pink"
            >
              <LucideLink
                className="inline-block mr-2 text-primary-dark-pink"
                size={18}
              />
              {user.website ? user.website : ""}
            </Link>
          )}

          <div className="flex flex-wrap items-center mb-2 text-sm font-semibold text-gray-700 gap-3 dark:text-gray-300">
            <span className="flex items-center gap-2">
              <LucideMapPin className="text-primary-dark-pink" size={18} />
              <span>
                {user && user.state ? user.state + "," : ""} {user?.location}
              </span>
            </span>

            {user?.is_model && (
              <span className="flex items-center gap-2">
                <LucideLock className="text-primary-dark-pink" size={18} />
                <span>Model</span>
              </span>
            )}

            <span className="flex items-center gap-2">
              <LucideCalendar className="text-primary-dark-pink" size={18} />
              <span>
                Joined{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </span>
            </span>
          </div>

          {user && (
            <ProfileCounts
              followers={user?.total_followers!}
              following={user?.total_following!}
              subscribers={user?.total_subscribers}
              isModel={user?.is_model!}
              userId={user?.user_id}
            />
          )}

          <ProfileSocialLinks Settings={user?.Settings} />

          {user?.is_model && <CreatorDashboardButton />}
        </div>
      </div>

      <ProfileTabs />
    </>
  );
};

export default ProfilePage;
