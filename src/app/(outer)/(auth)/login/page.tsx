"use client";
import { getUser } from "@/lib/User";
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
        },
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
            "redirect",
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
        },
      );
    }
  };

  // $SELECTION_PLACEHOLDER$ code:
  if (!hasCheckedAcceptedTerms) {
    return <div className="min-h-screen bg-black"></div>;
  }

  return (
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
          <div className="pt-12 mx-auto mb-24 max-w-screen-xl md:mt-16">
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
            <div className="flex flex-col mb-4 gap-3">
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleLoginInput}
                className="block w-full px-3 py-3 text-sm font-bold text-white bg-transparent rounded-lg outline-white outline-1 md:max-w-lg"
                placeholder="Email"
              />
            </div>
            <div className="flex flex-col mb-5 gap-3">
              <input
                type="password"
                name="password"
                id="password"
                onChange={handleLoginInput}
                className="block w-full px-3 py-3 text-sm font-bold text-white bg-transparent rounded-lg outline-white outline-1 md:max-w-lg"
                placeholder="Password"
              />
            </div>
            <button className="w-full px-3 py-3 text-sm font-bold text-white rounded-lg cursor-pointer bg-primary-dark-pink md:max-w-lg hover:bg-primary-dark-pink/80 transition-all duration-200">
              Sign in
            </button>
          </form>
          <div className="flex items-center w-full mt-5 md:max-w-lg">
            <div className="flex">
              <input
                type="checkbox"
                name="remember"
                id="remember"
                className="mr-2 text-sm accent-primary-dark-pink"
              />
              <label
                htmlFor="remember"
                className="text-sm font-bold text-white cursor-pointer "
              >
                Remember me
              </label>
            </div>
            <Link
              href="/reset"
              className="ml-auto text-sm font-bold text-primary-dark-pink "
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
