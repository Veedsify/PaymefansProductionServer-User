"use client";
import { useSideBarContext } from "@/lib/pageContexts";
import {
  LucideSettings,
  LucideLogOut,
  LucideHelpCircle,
  LucideUser,
  LucideHeart,
  LucideAirplay,
  LucideStore,
  LucideMessageSquare,
  LucideUserPlus,
  Router,
  LucideBell,
  MessageCircle,
  User,
  LucideShield,
  LucideShieldCheck,
} from "lucide-react";
import { useContext, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import swal from "sweetalert";
import { useUserAuthContext } from "@/lib/userUseContext";
import PointsCount from "../sub_components/sub/point-count";
import { useConversationsContext } from "@/contexts/messages-conversation-context";
import { useNotificationStore } from "@/contexts/notification-context";
import NotificationSidebarLink from "../sub_components/sub/notification-sidebar-link";

const SideBar = () => {
  const router = useRouter();
  const { sideBarState, setSideBar } = useSideBarContext();
  const pathname = usePathname();
  const { user } = useUserAuthContext();
  const { count } = useConversationsContext();
  const { notifications } = useNotificationStore();

  useEffect(() => {
    const closeSideBar = () => {
      setSideBar(false);
    };
    closeSideBar();
  }, [pathname, setSideBar]);

  const LogOut = () => {
    document.cookie = `token=; expires=${new Date()}; path=/;`;
    router.push("/login");
  };

  return (
    <>
      <div
        className={`lg:ml-auto dark:bg-gray-950 bg-white h-screen lg:h-screen fixed lg:sticky top-0  z-[65] md:z-[50] overflow-auto smart-width p-4 shadow-xl lg:shadow-none lg:border-r duration-300 ease-in-out dark:text-white dark:border-slate-800 ${
          sideBarState ? "left-0" : "-left-full"
        }`}
      >
        <div className="mt-8 mb-16 ">
          <Image
            className="block h-8 w-36"
            width={150}
            height={30}
            priority
            src="/site/logo2.png"
            alt=""
          />
        </div>
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Image
              width={50}
              height={50}
              priority
              src={
                user && user.profile_image && user.profile_image != ""
                  ? user?.profile_image
                  : "/site/avatar.png"
              }
              className="object-cover w-12 h-12 rounded-full"
              alt=""
            />
            <div>
              <h2 className="mb-0 text-sm font-bold leading-none">
                {user?.name ? (
                  user.name
                ) : (
                  <p className="w-32 rounded-sm mb-1 h-5 bg-gray-300 animate-pulse"></p>
                )}
              </h2>
              <span className="text-sm dark:text-white text-gray-600">
                {user ? (
                  user.username
                ) : (
                  <p className="w-32 rounded-sm h-3 bg-gray-300 animate-pulse"></p>
                )}
              </span>
            </div>
          </div>
          <div className="pt-5 mb-3">
            {user ? (
              <PointsCount user={user} />
            ) : (
              <div className="w-1/2 p-2 py-3 animate-pulse bg-gray-300 rounded-md"></div>
            )}
            <span className="text-sm font-medium dark:text-white text-gray-600">
              Your Balance
            </span>
          </div>
          <div className="flex gap-3 pt-4 mb-5 ">
            <Link
              href="/points"
              className="p-2 px-8 text-xs font-semibold text-white bg-black dark:bg-primary-dark-pink rounded"
            >
              Add Funds
            </Link>
            <Link
              href="/wallet"
              className="p-2 px-8 text-xs font-semibold text-black bg-white border border-gray-600 rounded"
            >
              Wallet
            </Link>
          </div>
          <div className="pt-6">
            <Link
              href="/profile"
              className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
            >
              <User size={25} />
              <p>Profile</p>
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
            >
              <MessageCircle size={25} />
              <p>Messages</p>
              <span className="ml-auto h-8 w-8 p-0 font-bold items-center justify-center flex rounded-full bg-primary-dark-pink text-white">
                {count ? count : 0}
              </span>
            </Link>
            <Link
              href="/hookup"
              className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
            >
              <LucideHeart />
              <p>Hook Up</p>
            </Link>
            <Link
              href="/store"
              className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
            >
              <LucideStore />
              <p>Store</p>
            </Link>

            {user?.is_model && (
              <Link
                href="/live"
                className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
              >
                <LucideAirplay />
                <p>Go Live</p>
              </Link>
            )}
            <NotificationSidebarLink />
            {user?.is_model && user.Model?.verification_status == false && (
              <Link
                href="/verification"
                className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
              >
                <LucideShieldCheck />
                <p>Verification</p>
              </Link>
            )}
            {!user?.is_model && (
              <Link
                href="/models/benefits"
                className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
              >
                <LucideUserPlus />
                <p>Become A Model</p>
              </Link>
            )}
            <hr className="mt-8 mb-8 dark:border-slate-800" />
            <Link
              href="/help"
              className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
            >
              <LucideHelpCircle />
              <p>Help</p>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
            >
              <LucideSettings />
              <p>Settings & Privacy</p>
            </Link>
            <span
              className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl cursor-pointer select-none"
              onClick={() => {
                swal({
                  title: "Are you sure?",
                  text: "You are about to logout",
                  icon: "/icons/error.svg",
                  buttons: ["Cancel", "Logout"],
                  dangerMode: true,
                }).then((willLogout) => {
                  if (willLogout) {
                    LogOut();
                  }
                });
              }}
            >
              <LucideLogOut />
              <p>Logout</p>
            </span>
          </div>
        </div>
      </div>
      <div
        onClick={() => setSideBar(false)}
        className={`lg:hidden block fixed inset-0 z-[64] md:z-[49]  w-full bg-opacity-50 duration-300 ease-in-out bg-black ${
          sideBarState
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      ></div>
    </>
  );
};

export default SideBar;
