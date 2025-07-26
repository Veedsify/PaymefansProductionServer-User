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
    <div className="min-h-dvh lg:p-0 bg-black p-5">
      <div className="lg:grid grid-cols-2 items-start justify-center mx-auto">
        <div className="min-h-dvh hidden lg:block relative">
          <Image
            width={1200}
            height={1200}
            priority
            src="/images/auth_image.jpeg"
            alt="Login Image"
            className="h-full absolute object-cover inset-0 w-full "
          />
        </div>
        <div className="h-full lg:p-14 2xl:p-28">
          <div className="max-w-screen-xl pt-12 mx-auto mb-24 md:mt-16">
            <Link href="/client/public">
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
          <h1 className="mt-auto mb-5 text-2xl font-bold text-white ">
            Reset Password
          </h1>
          <form
            action=""
            method="post"
            className="flex-1 w-full mb-5"
            autoComplete="off"
            onSubmit={(e) => e.stopPropagation()}
            autoFocus={false}
          >
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="email"
                name="email"
                id="email"
                className="block w-full px-3 py-3 text-sm font-bold text-white bg-transparent rounded-lg outline-white outline-1 md:max-w-lg"
                placeholder="Email"
              />
            </div>
            <div className="flex items-center md:max-w-lg w-full mb-3 ">
              <button className="text-sm hover:underline font-bold text-primary-dark-pink cursor-pointer ml-auto">
                Send Reset Code
              </button>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                name="verificationCode"
                id="verificationCode"
                maxLength={6}
                onChange={handleCodeInput}
                className="block w-full px-3 py-3 text-lg font-bold text-white bg-transparent rounded-lg outline-white outline-1 md:max-w-lg"
                placeholder="*** ***"
              />
            </div>
            <div className="mb-3">
              {error && (
                <p className="text-sm font-bold text-red-500">{error}</p>
              )}
            </div>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="password"
                name="password"
                id="password"
                className="block w-full px-3 py-3 text-sm font-bold text-white bg-transparent rounded-lg outline-white outline-1 md:max-w-lg"
                placeholder="Password"
              />
            </div>
            <button className="w-full px-3 py-3 text-sm font-bold text-white rounded-lg bg-primary-dark-pink md:max-w-lg">
              Reset Password
            </button>
          </form>
          <div className="mt-28">
            <p className="text-sm font-bold text-white">
              Back To Login?{" "}
              <Link href="/login" className="text-primary-dark-pink">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
