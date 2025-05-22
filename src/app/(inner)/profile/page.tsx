import BannerComponent from "@/components/lib_components/banner_component";
import EditProfileButton from "@/components/sub_components/editprofileButton";
import { ProfileCounts } from "@/components/sub_components/profile-count";
import ProfileSocialLinks from "@/components/sub_components/profile-social-links";
import ProfileTabs from "@/components/sub_components/profile_tabs";
import { AuthUserProps } from "@/types/user";
import getUserData from "@/utils/data/user-data";

import {
  LucideCalendar,
  LucideLink,
  LucideLock,
  LucideMapPin,
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Profile",
  description: "Profile page",
};

const ProfilePage = async () => {
  const user: AuthUserProps | null = await getUserData();
  return (
    <>
      <div className="overflow-hidden">
        <div className="relative">
          <Image
            src={user ? user.profile_banner : "/site/banner.png"}
            alt="Home Banner"
            width={1950}
            height={650}
            priority
            className="inset-0 aspect-21-9 object-cover w-full h-full"
          />
        </div>
        <div className="relative flex w-full px-2 md:px-5">
          <Image
            src={user ? user.profile_image.trim() : "/site/avatar.png"}
            alt="proile image"
            height={100}
            width={100}
            className="absolute object-cover md:w-24 md:h-24 w-20 h-20 sm:border-4 border-2 rounded-full md:-top-12  -top-6 border-primary-dark-pink "
          />
          <div className="flex items-center gap-3 sm:p-3 ml-auto p-3  ">
            <EditProfileButton user={user} />
          </div>
        </div>
        <div className="flex flex-col gap-2 px-2 mt-2 mb-12 md:px-5 items-start">
          <div className="flex flex-col">
            <h1 className="font-bold text-gray-900 dark:text-gray-100">
              {user?.name ? user.name : ""}
            </h1>
            <small className="text-gray-500 dark:text-gray-400">
              {user?.username}
            </small>
          </div>
          <div
            className="font-medium mb-2 leading-loose text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{
              __html: user?.bio
                ? user?.bio?.replace(/(?:\r\n|\r|\n)/g, "<br>")
                : "",
            }}
          ></div>
          {user?.website && (
            <>
              <Link
                href={user.website ? user.website : ""}
                target="_blank"
                className="font-medium text-primary-text-dark-pink dark:text-primary-dark-pink text-sm mb-2 inline-block"
              >
                <LucideLink
                  className="text-primary-dark-pink inline-block mr-2"
                  size={18}
                />
                {user.website ? user.website : ""}
              </Link>
            </>
          )}

          <div className="flex gap-3 flex-wrap text-sm items-center font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <span className="flex gap-2 items-center">
              <LucideMapPin className="text-primary-dark-pink" size={18} />
              <span>
                {user && user.state ? user.state + "," : ""} {user?.location}
              </span>
            </span>
            {user?.is_model ? (
              <span className="flex items-center gap-2">
                <LucideLock className="text-primary-dark-pink" size={18} />
                <span>Model</span>
              </span>
            ) : (
              ""
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
              followers={user?.total_followers}
              following={user?.total_following}
              subscribers={user?.total_subscribers}
              isModel={user?.is_model}
              userId={user?.user_id}
            />
          )}
          <ProfileSocialLinks Settings={user?.Settings} />
        </div>
      </div>
      <ProfileTabs />
    </>
  );

  function formatNumber(number: any): string {
    if (number >= 1000000000) {
      return (number / 1000000000).toFixed(1) + "B";
    } else if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + "K";
    } else {
      return Number(number).toLocaleString();
    }
  }
};

export default ProfilePage;
