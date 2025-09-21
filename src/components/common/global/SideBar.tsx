"use client";
import { motion } from "framer-motion";
import {
  LogOutIcon,
  LucideGroup,
  LucideHeart,
  LucideHelpCircle,
  LucideLightbulb,
  LucideLoader,
  LucideLogOut,
  LucideMoon,
  LucideSettings,
  LucideShieldCheck,
  LucideStore,
  LucideUserPlus,
  MessageCircle,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useMessagesConversation } from "@/contexts/MessageConversationContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import { useSideBarContext } from "@/lib/PageContext";
import axiosInstance from "@/utils/Axios";
import NotificationSideBarLink from "../../../features/notifications/NotificationSideBarLink";
import PointsCount from "../../../features/points/PointCount";
import useThemeToggle from "../toggles/ThemeToggle";
import FormatName from "@/lib/FormatName";
import LoadingSpinner from "../loaders/LoadingSpinner";

const SideBar = React.memo(() => {
  const router = useRouter();
  const { sideBarState, setSideBar } = useSideBarContext();
  const [willLogout, setWillLogout] = useState(false);
  const pathname = usePathname();
  const { user, isGuest } = useAuthContext();
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
        className={`lg:ml-auto dark:bg-black bg-white h-dvh lg:h-dvh fixed lg:sticky top-0 z-[200] lg:z-[200] overflow-auto smart-width p-4 shadow-xl lg:shadow-none dark:border-r-gray-500 border-r lg:border-r border-black/20 scrollbar-stable transition-transform duration-300 ease-in-out dark:text-white dark:border-slate-800/100 ${
          sideBarState ? "-translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mt-8 mb-16 ">
          <Image
            className="block h-8 w-36"
            width={150}
            height={30}
            priority
            src="/site/logo.svg"
            alt=""
          />
        </div>
        <div>
          <div className="flex items-center mb-4 gap-4">
            <Image
              width={50}
              height={50}
              priority
              src={user && !isGuest ? user?.profile_image! : "/site/avatar.png"}
              className="object-cover w-12 h-12 border-2 rounded-full border-primary-dark-pink"
              alt=""
            />
            <div className="overflow-hidden">
              <h2 className="mb-0 text-sm font-bold leading-none">
                {user?.name ? (
                  FormatName(user.name)
                ) : (
                  <p className="w-32 h-5 mb-1 bg-gray-300 rounded-sm animate-pulse"></p>
                )}
              </h2>
              <span className="text-sm text-gray-600 dark:text-white text-wrap max-w-8">
                {!isGuest && user ? (
                  user?.username
                ) : (
                  <span className="flex items-center mt-2">
                    <Link
                      href="/login"
                      className="text-primary-dark-pink font-semibold hover:underline"
                    >
                      Login
                    </Link>
                    &nbsp;{" /"} &nbsp;
                    <Link
                      href="/register"
                      className="text-primary-dark-pink font-semibold hover:underline"
                    >
                      Signup
                    </Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {!isGuest && (
            <>
              <div className="pt-5 mb-3">
                {user ? (
                  <PointsCount enableBackgroundUpdates={false} user={user} />
                ) : (
                  <div className="w-1/2 p-2 py-3 bg-gray-300 animate-pulse rounded-md"></div>
                )}
                <span className="text-sm font-medium text-gray-600 dark:text-white">
                  Your Balance
                </span>
              </div>
              <div className="flex pt-4 mb-5 gap-3 text-nowrap">
                <Link
                  href="/points"
                  className="p-2 px-8 text-xs font-semibold text-white bg-black rounded dark:bg-primary-dark-pink"
                >
                  Add Funds
                </Link>
                <Link
                  href="/wallet"
                  className="p-2 px-8 text-xs font-semibold text-black bg-white border border-gray-600 rounded dark:text-white dark:bg-gray-800 dark:border-gray-500"
                >
                  Wallet
                </Link>
              </div>
            </>
          )}

          <div className="pt-6">
            {!isGuest && (
              <>
                <Link
                  href="/profile"
                  className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl active:bg-gray-200"
                >
                  <User className="h-6 md:h-6" />
                  <p>Profile</p>
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl active:bg-gray-200"
                >
                  <MessageCircle className="h-6 md:h-6" />
                  <p>Messages</p>
                  <span className="flex items-center justify-center w-8 h-8 p-0 ml-auto font-bold text-white rounded-full bg-primary-dark-pink">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </Link>
                <Link
                  href="/hookup"
                  className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl active:bg-gray-200"
                >
                  <LucideHeart className="h-6 md:h-6" />
                  <p>Hook Up</p>
                </Link>
                <Link
                  href="/store"
                  className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl active:bg-gray-200"
                >
                  <LucideStore className="h-6 md:h-6" />
                  <p>Store</p>
                </Link>
                {(user?.is_model || user?.admin) && (
                  <Link
                    href="/groups"
                    className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl active:bg-gray-200"
                  >
                    <LucideGroup className="h-6 md:h-6" />
                    <p>Creator&apos;s Group</p>
                  </Link>
                )}
                <NotificationSideBarLink />
                {user?.is_model && user.Model?.verification_status == false && (
                  <Link
                    href="/verification"
                    className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl active:bg-gray-200"
                  >
                    <LucideShieldCheck className="h-6 md:h-6" />
                    <p>Verification</p>
                  </Link>
                )}
                {!user?.is_model && (
                  <Link
                    href="/models/benefits"
                    className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl active:bg-gray-200"
                  >
                    <LucideUserPlus className="h-6 md:h-6" />
                    <p>Become A Model</p>
                  </Link>
                )}
                <hr className="mt-8 mb-8 dark:border-slate-800 border-black/20" />
              </>
            )}
            <Link
              href="/help"
              className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl active:bg-gray-200"
            >
              <LucideHelpCircle className="h-6 md:h-6" />
              <p>Help</p>
            </Link>
            {!isGuest && (
              <>
                <Link
                  href="/referral"
                  className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl active:bg-gray-200"
                >
                  <LucideUserPlus className="h-6 md:h-6" />
                  <p>Referrals</p>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center p-2 mb-2 gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl active:bg-gray-200"
                >
                  <LucideSettings className="h-6 md:h-6" />
                  <p>Settings & Privacy</p>
                </Link>
                <span
                  className="flex items-center p-2 mb-2 cursor-pointer select-none gap-5 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-900 rounded-xl"
                  onClick={() => setWillLogout(true)}
                >
                  <LucideLogOut className="h-6 md:h-6" />
                  <p>Logout</p>
                </span>
              </>
            )}
            <div className="flex justify-center mb-4 mt-14">
              <div className="w-1/2">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-white">
                    Theme
                  </span>
                </div>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="relative w-full h-6 bg-gray-200 rounded-full dark:bg-gray-800 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-dark-pink focus:ring-opacity-50"
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
                  <div className="flex items-center justify-between h-full px-2">
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
  const { user } = useAuthContext();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const LogOut = async () => {
    await axiosInstance.post("/auth/logout", { username: user?.username });
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
        className="w-full max-w-sm p-6 mx-4 bg-white dark:bg-gray-900 rounded-xl"
      >
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
          <LogOutIcon className="text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white">
          Logout
        </h3>
        <p className="mt-3 text-center text-gray-600 dark:text-gray-300">
          Are you sure you want to log out? This will end your current session.
        </p>
        <div className="flex justify-end mt-6 gap-6">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-gray-700 rounded-lg cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 font-medium text-white bg-red-600 rounded-lg cursor-pointer hover:bg-red-700 gap-2"
          >
            Yes Logout
            {loggingOut && <LoadingSpinner className="text-white" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

SideBar.displayName = "SideBar";

export default SideBar;
