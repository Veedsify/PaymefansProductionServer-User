"use client";
import { getUser } from "@/lib/User";
import axiosServer from "@/utils/Axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LOGIN_CONFIG } from "@/config/config";
import axios from "axios";
import ParentalGuide from "@/components/common/ParentalGuide";

const Login = () => {
  const { setUser } = getUser();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  // Add a new state to track when acceptedTerms has been read:
  const [hasCheckedAcceptedTerms, setHasCheckedAcceptedTerms] = useState(false);
  const router = useRouter();

  const handleAcceptTerms = async () => {
    localStorage.setItem("termsAccepted", "true");
    setAcceptedTerms(true);
  };

  useEffect(() => {
    const terms = localStorage.getItem("termsAccepted");
    if (terms) {
      setAcceptedTerms(terms === "true");
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

  const submitLoginForm = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const loginThisUser = await axios.post(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/login`,
        {
          ...loginCredentials,
        }
      );

      if (!loginThisUser?.data?.error) {
        if (loginThisUser?.data?.token && !loginThisUser?.data?.tfa) {
          toast.dismiss();
          toast.success(LOGIN_CONFIG.LOGIN_SUCCESSFUL_MSG, {
            id: "login",
          });
          document.cookie = `token=${loginThisUser.data.token}`;
          setUser(loginThisUser.data.user);
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
              window.location.href = "/";
              return;
            }
          }
        } else if (
          loginThisUser?.data?.tfa &&
          loginThisUser?.data?.token === null
        ) {
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

  // $SELECTION_PLACEHOLDER$ code:
  if (!hasCheckedAcceptedTerms) {
    return <div className="min-h-screen bg-black"></div>;
  }

  return (
    <div className="min-h-dvh lg:p-0 bg-black p-5">
      {!acceptedTerms && typeof window !== "undefined" && (
        <ParentalGuide setAcceptedTerms={handleAcceptTerms} />
      )}
      <div className="lg:grid grid-cols-2 items-start justify-center mx-auto">
        <div className="min-h-dvh hidden lg:block relative">
          <Image
            width={720}
            height={720}
            priority
            src="/images/auth_image.jpeg"
            alt="Login Image"
            className="h-full absolute object-cover inset-0 w-full aspect-square"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, transparent 70%, rgba(0,0,0,9) 100%)",
              pointerEvents: "none",
            }}
          ></div>
        </div>
        <div className="h-full lg:p-14 2xl:p-28">
          <div className="max-w-screen-xl pt-12 mx-auto mb-24 md:mt-16">
            <Link href="/">
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
          <h1 className="mt-auto mb-5 text-2xl font-bold text-white ">
            Sign in
          </h1>
          <form
            action=""
            method="post"
            className="flex-1 w-full mb-5"
            onSubmit={submitLoginForm}
          >
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleLoginInput}
                className="block w-full px-3 py-3 text-sm font-bold text-white bg-transparent rounded-lg outline-white outline-1 md:max-w-lg"
                placeholder="Email"
              />
            </div>
            <div className="flex flex-col gap-3 mb-5">
              <input
                type="password"
                name="password"
                id="password"
                onChange={handleLoginInput}
                className="block w-full px-3 py-3 text-sm font-bold text-white bg-transparent rounded-lg outline-white outline-1 md:max-w-lg"
                placeholder="Password"
              />
            </div>
            <button className="w-full px-3 py-3 text-sm font-bold text-white rounded-lg bg-primary-dark-pink md:max-w-lg cursor-pointer hover:bg-primary-dark-pink/80 transition-all duration-200">
              Sign in
            </button>
          </form>
          <div className="flex items-center md:max-w-lg w-full mt-5">
            <div className="flex">
              <input
                type="checkbox"
                name="remember"
                id="remember"
                className="mr-2 text-sm accent-primary-dark-pink"
              />
              <label
                htmlFor="remember"
                className="text-sm font-bold    text-white cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <Link
              href="/reset"
              className="text-sm font-bold text-primary-dark-pink  ml-auto"
            >
              Forgot password?
            </Link>
          </div>
          <div className="mt-28">
            <p className="text-sm font-bold text-white">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary-dark-pink">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
