"use client";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { LucideHelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { LOGIN_CONFIG } from "@/config/config";
import { useGuestModal } from "@/contexts/GuestModalContext";
import { getUser } from "@/lib/User";

const GuestLoginModal = () => {
  const open = useGuestModal((state) => state.open);
  const toggleModalClose = useGuestModal((state) => state.toggleModalClose);
  const message = useGuestModal((state) => state.message);

  const { setUser } = getUser();
  const router = useRouter();

  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });

  const handleLoginInput = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginCredentials({
      ...loginCredentials,
      [e.target.name]: e.target.value,
    });
  };

  const submitLoginForm = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const loginThisUser = await axios.post(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/login`,
        {
          ...loginCredentials,
        },
        {
          withCredentials: true,
        }
      );

      const loginError = loginThisUser?.data?.error;
      const loginToken = loginThisUser?.data?.token;
      const loginTfa = loginThisUser?.data?.tfa;
      const loginUser = loginThisUser?.data?.user;

      if (!loginError) {
        if (loginToken && !loginTfa) {
          toast.success(LOGIN_CONFIG.LOGIN_SUCCESSFUL_MSG, {
            id: "login",
          });
          const redirect = new URLSearchParams(window.location.search).get(
            "redirect"
          );
          if (redirect) {
            if (typeof window !== "undefined") {
              window.location.href = redirect;
              return;
            }
          } else {
            if (typeof window !== "undefined") {
              document.cookie = `token=${loginToken}; path=/`;
              setUser(loginUser);
                toggleModalClose();
                window.location.reload();
                return;
              }
              }
            } else if (
              loginThisUser?.data?.tfa &&
              loginThisUser?.data?.token === null
            ) {
              toggleModalClose();
              router.push("/verify");
              return;
            }
            return;
            } else {
            toast.error(loginThisUser?.data?.message, {
              id: "login",
            });
            }
          } catch (error: any) {
            console.error("Error while logging in:", error);
            toast.error(
            error.response?.data.message || "An error occurred while logging in",
            {
              id: "login",
            }
            );
          }
          };

          return (
          <AnimatePresence>
            {open && (
            <motion.div
              onClick={toggleModalClose}
              className="fixed flex items-center justify-center bg-black/70 backdrop-blur-md inset-0 z-[999] px-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl shadow-3xl max-w-md sm:max-w-lg w-full border border-gray-200 dark:border-gray-800 transition-all duration-300"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              >
              <div className="mb-5 sm:mb-8">
                <Image
                className="block h-7 sm:h-8 w-auto"
                width={150}
                height={30}
                priority
                src="/site/logo.svg"
                alt=""
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 sm:mb-6 text-gray-900 dark:text-white tracking-tight">
                Login Required
              </h2>
              <p className="mb-5 sm:mb-10 text-gray-700 dark:text-gray-300 text-base sm:text-base leading-relaxed">
                {message || "Please log in to continue."}
              </p>
              <form className="flex flex-col gap-4 sm:gap-6" onSubmit={submitLoginForm}>
                <div>
                <label
                  className="block text-gray-800 dark:text-gray-200 mb-2 font-semibold text-base"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={loginCredentials.email}
                  onChange={handleLoginInput}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-dark-pink dark:bg-gray-800 dark:text-white transition-all duration-200 text-base"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
                </div>
                <div>
                <label
                  className="block text-gray-800 dark:text-gray-200 mb-2 font-semibold text-base"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={loginCredentials.password}
                  onChange={handleLoginInput}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-dark-pink dark:bg-gray-800 dark:text-white transition-all duration-200 text-base"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                </div>
                <button
                type="submit"
                className="cursor-pointer w-full px-4 py-3.5 bg-primary-dark-pink text-white rounded-xl font-semibold hover:bg-primary-dark-pink/70 transition-all duration-200 text-base"
                >
                Login
                </button>
              </form>
              <Link
                href={"/reset"}
                className="text-primary-dark-pink flex justify-end my-2 text-sm font-medium hover:underline"
              >
                Forgot Password?
              </Link>
              <button
                onClick={toggleModalClose}
                className="mt-2 block cursor-pointer w-full px-4 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-base"
              >
                Cancel
              </button>
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-center items-center flex-col gap-2">
                <p>
                  Don't have an account?{" "}
                  <Link
                  href={"/register"}
                  className="text-primary-dark-pink font-semibold hover:underline"
                  >
                  Sign up
                  </Link>
                </p>
                <Link
                  href={"/s/contact"}
                  className="text-primary-dark-pink hover:underline font-semibold items-center flex gap-1"
                >
                  <LucideHelpCircle size={16} />
                  <span>Help</span>
                </Link>
                </div>
              </div>
              </motion.div>
            </motion.div>
            )}
          </AnimatePresence>
          );
        };

        export default GuestLoginModal;
