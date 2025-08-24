import usePostComponent from "@/contexts/PostComponentPreview";
import { LucideUser2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";

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

  return (
    <div className="z-20 flex items-center gap-3 rounded-full" ref={ref}>
      <Link href={`/${userProfile?.username}`}>
        {userProfile?.avatar ? (
          <Image
            width={64}
            height={64}
            quality={100}
            src={userProfile?.avatar}
            alt={userProfile?.name}
            className="md:w-16 md:h-16 w-12 h-12 rounded-full object-cover border-2 border-white/20"
          />
        ) : (
          <div className="md:w-16 md:h-16 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <LucideUser2 className="md:w-8 w-6 md:h-8 h-6 text-white" />
          </div>
        )}
      </Link>
      <div className="">
        <p className="text-white font-semibold text-base md:text-lg">
          <Link href={`/${userProfile?.username}`}>{userProfile?.name}</Link>
        </p>
        <p className="text-gray-300 text-xs md:text-sm">
          <Link href={`/${userProfile?.username}`}>
            {userProfile?.username}
          </Link>
        </p>
      </div>
    </div>
  );
};
export default UserProfileOverlay;
