import { LucideUser2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import usePostComponent from "@/contexts/PostComponentPreview";
import FormatName from "@/lib/FormatName";

const UserProfileOverlay = ({
  userProfile,
}: {
  userProfile: { username: string; name: string; avatar?: string } | null;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { close } = usePostComponent();
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && ref.current.contains(event.target as Node)) {
        close();
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [close, ref]);

  const [profile] = useMemo(() => {
    return [userProfile];
  }, [userProfile]);

  return (
    <div className="z-20 flex items-center gap-2 rounded-full" ref={ref}>
      <Link href={`/${profile?.username}`}>
        <Image
          width={64}
          height={64}
          src={profile?.avatar!}
          alt={profile?.name!}
          className="md:w-16 md:h-16 w-12 h-12 rounded-full object-cover border border-white"
        />
      </Link>
      <div className="">
        <p className="text-white text-sm font-semibold md:text-lg text-shadow-2xs">
          <Link href={`/${profile?.username}`}>
            {FormatName(profile?.name)}
          </Link>
        </p>
        <p className="text-gray-100 text-xs md:text-sm text-shadow-2xs">
          <Link href={`/${userProfile?.username}`}>
            {userProfile?.username}
          </Link>
        </p>
      </div>
    </div>
  );
};
export default UserProfileOverlay;
