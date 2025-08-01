import BannerComponent from "@/components/lib_components/BannerComponent";
import MoreProfileOptions from "@/components/profile/MoreProfileOptions";
import EditProfileButton from "@/components/sub_components/EditProfileButton";
import { ProfileCounts } from "@/components/sub_components/ProfileCount";
import ProfileSocialLinks from "@/components/sub_components/ProfileSocialLinks";
import ProfileTabs from "@/components/sub_components/ProfileTabs";
import { AuthUserProps } from "@/types/User";
import getUserData from "@/utils/data/UserData";

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
            priority
            unoptimized
            width={100}
            className="absolute object-cover md:w-24 md:h-24 w-20 h-20 sm:border-4 border-2 rounded-full md:-top-12  -top-6 border-primary-dark-pink "
          />
          <div className="flex items-center gap-3 sm:p-3 ml-auto p-3  ">
            <EditProfileButton user={user} />
            <MoreProfileOptions
              user={user as AuthUserProps}
              authUserId={Number(user?.id)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 px-2 mt-2 mb-6 md:px-5 items-start">
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
          {user?.is_model && (
            <>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-full border border-black/10">
                <h2 className="text-lg font-semibold mb-2">
                  Creator Dashboard
                </h2>
                <Link
                  href={"/analytics"}
                  className="text-primary-text-dark-pink dark:text-primary-dark-pink hover:underline text-sm"
                >
                  <p className="mb-2">
                    View your account performance and engagement metrics
                  </p>
                </Link>
              </div>
            </>
          )}
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
