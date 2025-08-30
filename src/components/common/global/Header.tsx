"use client";
import { LucideBellRing } from "lucide-react";
import HeaderTitle from "./HeaderTitle";
import Image from "next/image";
import HeaderImgClick from "../image/HeaderImageClick";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const Header = () => {
  const pathname = usePathname();
  const [notification, setNotification] = useState(false);
  const ref = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const handleClick = (e: any) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setNotification(false);
    }
  };

  const hideOn = (thisPathname: string[], originPath: string): boolean => {
    return !thisPathname?.some((path) => originPath.startsWith(path));
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleHomeClick = () => {
    if (pathname === "/") {
      router.refresh();
    }
    router.push("/");
  };

  return (
    <header
      className={`${
        hideOn(["/live"], pathname) && "px-4 lg:px-8 py-3"
      } absolute z-50 w-full bg-primary-dark-pink lg:bg-white dark:bg-black dark:text-white border-b border-black/20 dark:border-slate-800/100`}
    >
      <div className="flex items-center">
        <HeaderTitle />
        <button onClick={handleHomeClick} className="cursor-pointer">
          <Image
            width={120}
            height={40}
            src="/site/logo3.png"
            alt=""
            className="block h-auto lg:hidden"
          />
        </button>
        <ul className="flex items-center ml-auto gap-6 lg:hidden">
          <Link href="/notifications">
            <LucideBellRing stroke="#fff" />
          </Link>
          <HeaderImgClick />
        </ul>
      </div>
    </header>
  );
};

export default Header;
