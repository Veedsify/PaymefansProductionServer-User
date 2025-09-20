"use client";
import Image from "next/image";
import { useAuthContext } from "@/contexts/UserUseContext";
import { useSideBarContext } from "@/lib/PageContext";

const HeaderImgClick = () => {
  const { setSideBar } = useSideBarContext();
  const { user } = useAuthContext();
  return (
    <li>
      <span
        className="block w-12 h-12 border-2 border-white rounded-full cursor-pointer"
        onClick={() => setSideBar(true)}
      >
        <Image
          width={50}
          height={50}
          priority
          src={user?.profile_image || "/site/avatar.png"}
          alt=""
          className="object-cover w-full h-full rounded-full"
        />
      </span>
    </li>
  );
};

export default HeaderImgClick;
