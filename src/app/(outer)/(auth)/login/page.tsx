"use client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ParentalGuide from "@/components/common/global/ParentalGuide";
import { LOGIN_CONFIG } from "@/config/config";
import { getUser } from "@/lib/User";
import axiosInstance from "@/utils/Axios";
import Footer from "@/components/common/global/Footer";

const Login = () => {
  const { setUser } = getUser();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  // Add a new state to track when acceptedTerms has been read:
  const [hasCheckedAcceptedTerms, setHasCheckedAcceptedTerms] = useState(false);
  const router = useRouter();

  const handleAcceptTerms = async () => {
    sessionStorage.setItem("termsAccepted", "true");
    setAcceptedTerms(true);
  };

  useEffect(() => {
    const terms = sessionStorage.getItem("termsAccepted");
    if (terms) {
      setAcceptedTerms(true);
    }
    setHasCheckedAcceptedTerms(true);
  }, []);

  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    document.title = "Login | Paymefans";
  }, [router]);

  const handleLoginInput = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginCredentials({
      ...loginCredentials,
      [e.target.name]: e.target.value,
    });
  };

  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/auth/login`, {
        ...loginCredentials,
      });
      return res.data;
    },
    onSuccess: (data) => {
      const loginError = data?.error;
      const loginToken = data?.token;
      const loginTfa = data?.tfa;
      const loginUser = data?.user;

      if (!loginError) {
        if (loginToken && !loginTfa) {
          toast.success(LOGIN_CONFIG.LOGIN_SUCCESSFUL_MSG, { id: "login" });
          const redirect = new URLSearchParams(window.location.search).get(
            "redirect",
          );
          if (!redirect) {
            setUser(loginUser);
            router.push("/");
            return;
          }
          window.location.href = redirect;
          return;
        } else if (loginTfa && loginToken === null) {
          router.push("/verify");
          return;
        }
      } else {
        toast.error(data?.message, { id: "login" });
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "An error occurred while logging in",
        { id: "login" },
      );
    },
  });
  const submitLoginForm = async (e: FormEvent) => {
    e.preventDefault();
    loginMutate();
  };

  // $SELECTION_PLACEHOLDER$ code:
  if (!hasCheckedAcceptedTerms) {
    return <div className="min-h-screen bg-black"></div>;
  }

  return (
    <>
      <div className="p-5 bg-black min-h-dvh lg:p-0">
        {!acceptedTerms && typeof window !== "undefined" && (
          <ParentalGuide setAcceptedTerms={handleAcceptTerms} />
        )}
        <div className="items-start justify-center mx-auto lg:grid grid-cols-2">
          <div className="relative hidden min-h-dvh lg:block">
            <Image
              width={720}
              height={720}
              priority
              src="/images/auth_image.jpeg"
              alt="Login Image"
              className="absolute inset-0 object-cover w-full h-full aspect-square"
            />
            {/* Enhanced gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/60 to-black/95"></div>
            {/* Secondary gradient for extra depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>
          <div className="h-full lg:p-14 2xl:p-28">
            <div className="pt-12 mx-auto mb-16 max-w-screen-xl md:mt-16">
              <Link
                href="/"
                className="inline-block transition-transform hover:scale-105"
              >
                <Image
                  width={150}
                  height={25}
                  priority
                  className="h-auto w-[150px]"
                  src="/site/logo.svg"
                  alt="Logo"
                />
              </Link>
            </div>

            <div className="max-w-lg">
              <h1 className="mb-2 text-3xl font-bold text-white">
                Welcome back
              </h1>
              <p className="mb-8 text-gray-300">
                Sign in to your account to continue
              </p>
            </div>

            <form
              action=""
              method="post"
              className="flex-1 w-full mb-6"
              onSubmit={submitLoginForm}
            >
              <div className="flex flex-col mb-6 gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-300"
                >
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleLoginInput}
                  className="block w-full px-4 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 md:max-w-lg backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex flex-col mb-6 gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  onChange={handleLoginInput}
                  className="block w-full px-4 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 md:max-w-lg backdrop-blur-sm"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full px-4 py-3 disabled:bg-gray-500 text-sm font-semibold text-white rounded-xl cursor-pointer bg-primary-dark-pink  md:max-w-lg hover:from-primary-dark-pink/90 hover:to-primary-dark-pink/70 transition-all duration-200 shadow-lg hover:shadow-primary-dark-pink/25 hover:shadow-xl active:scale-[0.98]"
              >
                {isPending ? "Logging in..." : "Log In"}
              </button>
            </form>
            <div className="flex items-center w-full mt-6 md:max-w-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  id="remember"
                  className="w-4 h-4 mr-3 rounded border-white/20 bg-white/5 text-primary-dark-pink focus:ring-primary-dark-pink/50 focus:ring-2 accent-primary-dark-pink"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium text-gray-300 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/reset"
                className="ml-auto text-sm font-medium text-primary-dark-pink hover:text-primary-dark-pink/80 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>
            <div className="mt-16">
              <p className="text-sm font-medium text-gray-300">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary-dark-pink hover:text-primary-dark-pink/80 transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
