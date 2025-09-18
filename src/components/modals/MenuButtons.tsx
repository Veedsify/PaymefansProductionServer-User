"use client";
import { useModalContext } from "@/lib/PageContext";
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideHome,
  LucideMail,
  LucidePlus,
  LucideSearch,
  LucideUser2,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PostShareModal from "@/features/post/PostShareComponent";
const MenuButtons = () => {
  const pathname = usePathname();

  const paths = ["/live", "/chats", "/groups"];
  const hideOn = paths.some((path) => pathname.includes(path));
  return (
    <div className={`z-[100] ${hideOn ? "hidden" : "block"} lg:block`}>
      <NavigationBar />
    </div>
  );
};

const NavigationBar = () => {
  return (
    <div className="fixed bottom-0 right-0 flex w-full pointer-events-none lg:justify-end">
      <div className="flex py-4 md:py-8 border-t lg:border-none border-black/40 dark:border-slate-800 items-center justify-between px-8 md:px-16 dark:bg-black dark:text-white bg-white w-full lg:w-[37.5%] pointer-events-auto">
        <Link href="/" className="cursor-pointer">
          <LucideHome className="h-5 md:h-8" />
        </Link>
        <Link href="/search" className="cursor-pointer">
          <LucideSearch className="h-5 md:h-8" />
        </Link>
        <Link href="/posts/new" className="cursor-pointer">
          <LucidePlus className="h-5 md:h-8" />
        </Link>
        <Link href="/models" className="cursor-pointer">
          <LucideUser2 className="h-5 md:h-8" />
        </Link>
        <Link href="/messages" className="cursor-pointer">
          <LucideMail className="h-5 md:h-8" />
        </Link>
      </div>
    </div>
  );
};

const NavigationBarSlide = () => {
  const { setModal } = useModalContext();
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  return (
    <>
      <div
        className={`fixed  duration-300 transition-all right-0 flex pointer-events-all w-full lg:justify-end z-50 md:-bottom-0 pointer-events-none ${
          openMenu ? "-bottom-0" : "-bottom-20"
        }`}
      >
        <div className="flex py-7 items-center justify-between px-8 md:px-16   dark:bg-gray-950  dark:text-white  bg-white w-full lg:w-[33.3%] pointer-events-auto">
          <Link href="/client/public" className="cursor-pointer">
            <LucideHome />
          </Link>
          <span className="cursor-pointer">
            <LucideSearch />
          </span>
          <span className="cursor-pointer" onClick={() => setModal()}>
            <LucidePlus />
          </span>
          <Link href="/models" className="cursor-pointer">
            <LucideUser2 />
          </Link>
          <Link href="/messages" className="cursor-pointer">
            <LucideMail />
          </Link>
        </div>
        <div
          className="absolute flex items-center justify-center w-16 h-8 bg-white border border-b-0 border-gray-300 rounded-tl-lg rounded-tr-lg cursor-pointer -top-8 left-1/2 -translate-x-1/2 md:hidden"
          onClick={() => setOpenMenu(!openMenu)}
        >
          {openMenu ? (
            <LucideChevronDown size={30} className="cursor-pointer" />
          ) : (
            <LucideChevronUp size={30} className="cursor-pointer" />
          )}
        </div>
      </div>
    </>
  );
};

export default MenuButtons;
