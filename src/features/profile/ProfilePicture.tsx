"use client";

import Image from "next/image";
import { useMemo } from "react";
import { AuthUserProps } from "../user/types/user";

const ProfilePicture = ({ user }: { user: Partial<AuthUserProps> | null }) => {
  const profileImage = useMemo(
    () => (user ? user?.profile_image?.trim()! : "/site/avatar.png"),
    [user?.profile_image],
  );
  return (
    <>
      <Image
        src={profileImage}
        alt="proile image"
        height={100}
        priority
        unoptimized
        width={100}
        className="absolute object-cover w-20 h-20 border-2 rounded-full md:w-24 md:h-24 sm:border-4 md:-top-12  -top-6 border-primary-dark-pink"
      />
    </>
  );
};
export default ProfilePicture;
