import Image from "next/image";
import { LucidePlus} from "lucide-react";
import {useUserAuthContext} from "@/lib/UserUseContext";
import Link from "next/link";

const UserStatus = () => {
    const { user } = useUserAuthContext();
    return (
        <div className="relative block">
            <div className="relative flex items-center justify-center flex-shrink-0 w-20 h-20 mb-2 bg-gray-300 rounded-full cursor-pointer aspect-square md:h-24 md:w-24">
                <div className="flex p-[5px] bg-white items-center justify-center rounded-full">
                    <Link href={"/story"}>
                        <Image
                            width={80}
                            height={80}
                            priority
                            src={user ? user.profile_image : "/site/avatar.png"}
                            className="object-cover w-auto h-16 border-4 border-gray-300 rounded-full md:h-20 aspect-square"
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