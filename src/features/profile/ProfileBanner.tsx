"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { AuthUserProps } from "../user/types/user";

const ProfileBanner = ({ user }: { user: Partial<AuthUserProps> | null }) => {
  const profileBanner = useMemo(
    () => (user ? user.profile_banner! : "/site/banner.png"),
    [user?.profile_banner],
  );
  return (
    <>
      <Image
        src={profileBanner}
        alt="Home Banner"
        width={1950}
        height={650}
        priority
        className="inset-0 object-cover w-full h-full aspect-21-9"
      />
    </>
  );
};
export default ProfileBanner;
