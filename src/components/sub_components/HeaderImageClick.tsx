"use client"
import { useSideBarContext } from "@/lib/PageContext";
import { useUserAuthContext } from "@/lib/UserUseContext";
import Image from "next/image";

const HeaderImgClick = () => {
    const { setSideBar } = useSideBarContext()
    const { user } = useUserAuthContext()
    return (
        <li>
            <span
                className="block w-12 h-12 border-2 border-white rounded-full cursor-pointer"
                onClick={() => setSideBar(true)}
            >
                <Image width={50} height={50} priority src={user?.profile_image || "/site/avatar.png"} alt="" className="w-full h-full object-cover rounded-full" />
            </span>
        </li>
    );
}

export default HeaderImgClick;