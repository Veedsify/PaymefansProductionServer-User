"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LOGIN_CONFIG } from "@/config/config";
import { getUser } from "@/lib/User";
import axiosServer from "@/utils/Axios";

const Login = () => {
  const { setUser } = getUser();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    document.title = "Login | Paymefans";
  }, [router]);

  const handleCodeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const codeRegex = /^[0-9]*$/;
    const inputValue = e.target.value;
    setError("");
    if (codeRegex.test(inputValue) || inputValue === "") {
      if (inputValue.length > 6) {
        setError("Code must be 6 digits");
        e.target.value = inputValue.slice(0, 6);
        return;
      }
      setCode(inputValue);
    } else {
      e.preventDefault();
      setError("Invalid code format");
    }
  };
  return (
    <div className="p-5 bg-black min-h-dvh lg:p-0">
      <div className="items-start justify-center mx-auto lg:grid grid-cols-2">
        <div className="relative hidden min-h-dvh lg:block">
          <Image
            width={1200}
            height={1200}
            priority
            src="/images/auth_image.jpeg"
            alt="Login Image"
            className="absolute inset-0 object-cover w-full h-full"
          />
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/60 to-black/95"></div>
          {/* Secondary gradient for extra depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
        <div className="h-full lg:p-14 2xl:p-28">
          <div className="pt-12 mx-auto mb-16 max-w-screen-xl md:mt-16">
            <Link
              href="/login"
              className="inline-block transition-transform hover:scale-105"
            >
              <Image
                width={150}
                height={150}
                priority
                className="h-auto w-[150px]"
                src="/site/logo.svg"
                alt="Logo"
              />
            </Link>
          </div>

          <div className="max-w-lg mb-8">
            <h1 className="mb-2 text-3xl font-bold text-white">
              Reset your password
            </h1>
            <p className="text-gray-300">
              Enter your email to receive a reset code, then create a new
              password
            </p>
          </div>

          <form
            action=""
            method="post"
            className="flex-1 w-full mb-6"
            autoComplete="off"
            onSubmit={(e) => e.stopPropagation()}
            autoFocus={false}
          >
            <div className="flex flex-col mb-6 gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="block w-full px-4 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 md:max-w-lg backdrop-blur-sm"
                placeholder="Enter your email address"
              />
            </div>

            <div className="flex items-center w-full mb-6 md:max-w-lg">
              <button
                type="button"
                className="ml-auto px-4 py-2 text-sm font-medium text-primary-dark-pink bg-primary-dark-pink/10 rounded-lg hover:bg-primary-dark-pink/20 transition-all duration-200 border border-primary-dark-pink/20"
              >
                Send Reset Code
              </button>
            </div>

            <div className="flex flex-col mb-4 gap-2">
              <label
                htmlFor="verificationCode"
                className="text-sm font-medium text-gray-300"
              >
                Verification Code
              </label>
              <input
                type="text"
                name="verificationCode"
                id="verificationCode"
                maxLength={6}
                onChange={handleCodeInput}
                className="block w-full px-4 py-3 text-lg font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 md:max-w-lg backdrop-blur-sm text-center tracking-widest"
                placeholder="000000"
              />
            </div>

            {error && (
              <div className="mb-4 md:max-w-lg">
                <p className="text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              </div>
            )}

            <div className="flex flex-col mb-6 gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                New Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="block w-full px-4 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 md:max-w-lg backdrop-blur-sm"
                placeholder="Enter your new password"
              />
            </div>

            <button className="w-full px-4 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary-dark-pink to-primary-dark-pink/80 md:max-w-lg hover:from-primary-dark-pink/90 hover:to-primary-dark-pink/70 transition-all duration-200 shadow-lg hover:shadow-primary-dark-pink/25 hover:shadow-xl active:scale-[0.98]">
              Reset Password
            </button>
          </form>

          <div className="mt-12">
            <p className="text-sm font-medium text-gray-300">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary-dark-pink hover:text-primary-dark-pink/80 transition-colors duration-200"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
