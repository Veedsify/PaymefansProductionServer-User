"use client";
import { getUser } from "@/lib/User";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { getToken } from "@/utils/Cookie";
import { LOGIN_CONFIG } from "@/config/config";
import { LucideLoader } from "lucide-react";
import _ from "lodash";
import axiosInstance from "@/utils/Axios";

const Login = () => {
  const { setUser } = getUser();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const submitLoginForm = async (e: FormEvent) => {
    try {
      const response = await axiosInstance.post(`/auth/verify/authentication`, {
        code: Number(code),
      });

      if (response.status !== 200) {
        setError("Invalid code");
      }

      if (response.data.error) {
        setLoading(false);
        setError(response.data.message);
        toast.dismiss();
        return;
      }

      setLoading(false);
      toast.success(LOGIN_CONFIG.LOGIN_SUCCESSFUL_MSG);
      setUser(response.data.user);
      const redirect = new URLSearchParams(window.location.search).get(
        "redirect"
      );
      const destination = redirect || "/";
      if (typeof window !== "undefined") {
        window.location.href = destination;
      }
      return;
    } catch (error: any) {
      setLoading(false);
      console.log(error);
      setError(
        error?.response?.data?.message || error?.message || "An error occurred"
      );
    }
  };

  const debounceSubmitLoginForm = _.debounce(submitLoginForm, 300);

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
            className="absolute inset-0 object-cover w-full h-full "
          />
        </div>
        <div className="h-full lg:p-14 2xl:p-28">
          <div className="pt-12 mx-auto mb-24 max-w-screen-xl md:mt-16">
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
            Verify Your Account
          </h1>
          <p className="mb-5 text-sm text-white md:max-w-lg">
            We sent a verification code to your email. Enter the code below to
            verify your account. Check spam folder if not received or request a
            new code.
          </p>
          <form
            action=""
            method="post"
            className="flex-1 w-full mb-5"
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              setError("");
              debounceSubmitLoginForm(e);
            }}
          >
            <div className="flex flex-col mb-4 gap-3">
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
              {loading && (
                <LucideLoader className="w-5 h-5 text-primary-dark-pink animate-spin" />
              )}
            </div>
            <button className="w-full px-3 py-3 text-sm font-bold text-white rounded-lg bg-primary-dark-pink md:max-w-lg">
              Verify Account
            </button>
          </form>
          <div className="flex items-center w-full mt-5 md:max-w-lg">
            <Link
              href="/client/public"
              className="ml-auto text-sm font-bold text-primary-dark-pink "
            >
              Resend Code
            </Link>
          </div>
          <div className="mt-28">
            <p className="text-sm font-bold text-white">
              Back to{" "}
              <Link href="/login" className="text-primary-dark-pink">
                Login
              </Link>{" "}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
