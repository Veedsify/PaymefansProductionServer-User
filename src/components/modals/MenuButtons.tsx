"use client";
import {
  LucideHome,
  LucidePlus,
  LucideSearch,
  LucideUser2,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/UserUseContext";
import { cn } from "../ui/cn";

const MenuButtons = () => {
  const { isGuest } = useAuthContext();
  const pathname = usePathname();
  const paths = ["/live", "/chats", "/groups"];
  const hideOn = paths.some((path) => pathname.includes(path));
  if (isGuest) {
    return null;
  }
  return (
    <div className={`z-[100] ${hideOn ? "hidden" : "block"} lg:block`}>
      <NavigationBar />
    </div>
  );
};

const NavigationBar = () => {
  const navigationLinks = [
    { name: "Home", href: "/", icon: LucideHome },
    { name: "Search", href: "/search", icon: LucideSearch },
    { name: "New Post", href: "/new", icon: LucidePlus },
    { name: "Models", href: "/models", icon: LucideUser2 },
    { name: "Messages", href: "/messages", icon: MessageCircle },
  ];
  const pathname = usePathname();
  return (
    <div className="fixed bottom-0 right-0 flex w-full pointer-events-none lg:justify-end">
      <div className="flex border-t lg:border-none border-black/40 dark:border-slate-800 items-center justify-between dark:bg-black dark:text-white bg-white w-full lg:w-[37.5%] pointer-events-auto">
        {navigationLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="cursor-pointer flex-1 w-full text-center  py-4 md:py-8 px-8 md:px-16 "
          >
            <link.icon
              className={cn("h-5 md:h-8", {
                "stroke-black": pathname !== link.href,
                "stroke-primary-dark-pink": pathname === link.href,
              })}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuButtons;
