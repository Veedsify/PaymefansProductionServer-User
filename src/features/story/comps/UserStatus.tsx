import { LucidePlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/contexts/UserUseContext";

const UserStatus = () => {
  const { user } = useAuthContext();
  return (
    <div className="relative block">
      <div className="relative flex items-center justify-center flex-shrink-0 w-18 h-18 mb-2 bg-gray-300  dark:bg-primary-dark-pink rounded-full cursor-pointer aspect-square md:h-22 md:w-22">
        <div className="flex p-[2px] bg-gray-300 dark:bg-white items-center justify-center rounded-full">
          <Link href={"/story"}>
            <Image
              width={79}
              height={79}
              priority
              src={user ? user.profile_image! : "/site/avatar.png"}
              className="object-cover w-auto h-16 border-4 dark:border-white rounded-full aspect-square"
              alt=""
            />
          </Link>
        </div>
        <div className="absolute right-0 p-1 text-xs text-white border-4 border-white rounded-full bg-primary-dark-pink -bottom-0 scale-90">
          <LucidePlus stroke="#fff" size={15} strokeWidth={3} />
        </div>
      </div>
      <div className="absolute w-20 overflow-hidden text-xs font-medium text-center text-gray-600 whitespace-pre md:text-sm left-1/2 -translate-x-1/2 dark:text-gray-200 text-truncate">
        Your status
      </div>
    </div>
  );
};

export default UserStatus;
