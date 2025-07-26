"use client";
import { useSideBarContext } from "@/lib/PageContext";
import {
  LucideSettings,
  LucideLogOut,
  LucideHelpCircle,
  LucideHeart,
  LucideStore,
  LucideUserPlus,
  MessageCircle,
  User,
  LucideShieldCheck,
  LucideGroup,
  LucideLightbulb,
  LucideLightbulbOff,
  LucideMoon,
  AlertTriangle,
  LogOutIcon,
  LucideLoader2,
  Moon,
} from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import swal from "sweetalert";
import { useUserAuthContext } from "@/lib/UserUseContext";
import PointsCount from "../sub_components/sub/PointCount";
import NotificationSideBarLink from "../sub_components/sub/NotificationSideBarLink";
import useThemeToggle from "../sub_components/sub/ThemeToggle";
import axiosInstance from "@/utils/Axios";
import { useMessagesConversation } from "@/contexts/MessageConversationContext";
import { motion } from "framer-motion";

const SideBar = React.memo(() => {
  const router = useRouter();
  const { sideBarState, setSideBar } = useSideBarContext();
  const [willLogout, setWillLogout] = useState(false);
  const pathname = usePathname();
  const { user } = useUserAuthContext();
  const { unreadCount } = useMessagesConversation();
  const { theme, setTheme } = useThemeToggle();
  useEffect(() => {
    const closeSideBar = () => {
      setSideBar(false);
    };
    closeSideBar();
  }, [pathname, setSideBar]);

  return (
    <>
      <div
        className={`lg:ml-auto dark:bg-black bg-white h-dvh lg:h-dvh fixed lg:sticky top-0 z-[200] lg:z-[200] overflow-auto smart-width p-4 shadow-xl lg:shadow-none lg:border-r border-black/40 transition-transform duration-300 ease-in-out dark:text-white dark:border-slate-800/100 ${
          sideBarState ? "-translate-x-0" : "-translate-x-full lg:translate-x-0"
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
              className="object-cover w-12 h-12 rounded-full border-2 border-primary-dark-pink"
              alt=""
            />
            <div className="overflow-hidden">
              <h2 className="mb-0 text-sm font-bold leading-none">
                {user?.name ? (
                  user.name
                ) : (
                  <p className="w-32 rounded-sm mb-1 h-5 bg-gray-300 animate-pulse"></p>
                )}
              </h2>
              <span className="text-sm dark:text-white text-gray-600 text-wrap max-w-8">
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
              className="p-2 px-8 text-xs font-semibold text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-600 dark:border-gray-500 rounded"
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
                {unreadCount > 99 ? "99+" : unreadCount}
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

            {(user?.is_model || user?.admin) && (
              <>
                {/*<Link*/}
                {/*  href="/live"*/}
                {/*  className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"*/}
                {/*>*/}
                {/*  <LucideAirplay />*/}
                {/*  <p>Go Live</p>*/}
                {/*</Link>*/}
                <Link
                  href="/groups"
                  className="flex items-center gap-5 p-2 mb-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
                >
                  <LucideGroup />
                  <p>Creator&apos;s Group</p>
                </Link>
              </>
            )}
            <NotificationSideBarLink />
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
            <hr className="mt-8 mb-8 dark:border-slate-800 border-black/40" />
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
              onClick={() => setWillLogout(true)}
            >
              <LucideLogOut />
              <p>Logout</p>
            </span>
            <div className="flex justify-center mt-14 mb-4">
              <div className="w-1/2">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-xs font-medium dark:text-white text-gray-600">
                    Theme
                  </span>
                </div>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="relative w-full h-6 bg-gray-200 dark:bg-gray-800 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-dark-pink focus:ring-opacity-50"
                >
                  <div
                    className={`absolute top-0.5 left-0.5 h-5 w-1/2 bg-white dark:bg-gray-700 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
                      theme === "dark" ? "translate-x-full" : "translate-x-0"
                    }`}
                  >
                    {theme === "dark" ? (
                      <LucideMoon stroke="white" size={12} />
                    ) : (
                      <LucideLightbulb stroke="gold" size={12} />
                    )}
                  </div>
                  <div className="flex items-center justify-between px-2 h-full">
                    <span
                      className={`text-xs font-medium transition-colors ${
                        theme === "light" ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      Light
                    </span>
                    <span
                      className={`text-xs font-medium transition-colors ${
                        theme === "dark" ? "text-white" : "text-gray-400"
                      }`}
                    >
                      Dark
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={() => setSideBar(false)}
        className={`lg:hidden block fixed inset-0 z-[64] md:z-[49]  w-full duration-300 ease-in-out bg-black/50 ${
          sideBarState
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      ></div>
      {willLogout && <LogOutModal onClose={() => setWillLogout(false)} />}
    </>
  );
});
const LogOutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useUserAuthContext();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const LogOut = async () => {
    document.cookie = `token=; expires=${new Date()}; path=/;`;
    await axiosInstance.post("/logout", { username: user?.username });
    router.push("/login");
  };
  const handleLogout = async () => {
    setLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    LogOut();
    setLoggingOut(false);
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300]"
      onClick={onClose}
    >
      <motion.div
        initial={{
          scale: 0.6,
          opacity: 0,
          transformOrigin: "center",
        }}
        animate={{
          scale: 1,
          opacity: 1,
          transformOrigin: "center",
        }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full mx-4"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
          <LogOutIcon className="text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center">
          Logout
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-center">
          Are you sure you want to log out? This will end your current session.
        </p>
        <div className="mt-6 flex gap-6 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 cursor-pointer inline-flex items-center gap-2"
          >
            Yes Logout
            {loggingOut && (
              <LucideLoader2 className="animate-spin text-white" />
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

SideBar.displayName = "SideBar";

export default SideBar;
