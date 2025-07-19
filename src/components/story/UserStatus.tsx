import Image from "next/image";
import { LucidePlus} from "lucide-react";
import {useUserAuthContext} from "@/lib/UserUseContext";
import Link from "next/link";

const UserStatus = () => {
    const { user } = useUserAuthContext();
    return (
        <div className="block relative">
            <div className="flex items-center bg-gray-300 flex-shrink-0 justify-center cursor-pointer rounded-full aspect-square h-20 w-20 md:h-24 md:w-24 relative mb-2">
                <div className="flex p-[5px] bg-white items-center justify-center rounded-full">
                    <Link href={"/story"}>
                        <Image
                            width={80}
                            height={80}
                            priority
                            src={user ? user.profile_image : "/site/avatar.png"}
                            className="rounded-full object-cover border-4 border-gray-300 w-auto h-16 md:h-20 aspect-square"
                            alt=""
                        />
                    </Link>
                </div>
                <div className="p-1 bg-primary-dark-pink text-white text-xs border-4 border-white absolute -bottom-0 right-0 scale-90 rounded-full">
                    <LucidePlus stroke="#fff" size={15} strokeWidth={3} />
                </div>
            </div>
            <div className="text-xs md:text-sm left-1/2 -translate-x-1/2 font-medium absolute dark:text-gray-200 text-gray-600 text-center text-truncate whitespace-pre w-20 overflow-hidden">
                Your status
            </div>
        </div>
    );
};

export default UserStatus;