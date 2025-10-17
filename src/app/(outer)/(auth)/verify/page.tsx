"use client";
import { debounce } from "lodash-es";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { LOGIN_CONFIG } from "@/config/config";
import { getUser } from "@/lib/User";
import axiosInstance from "@/utils/Axios";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

const Login = () => {
  const { setUser } = getUser();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationType, setVerificationType] = useState<
    "registration" | "tfa"
  >("tfa");

  useEffect(() => {
    // Get email and verification type from sessionStorage
    const storedEmail = sessionStorage.getItem("verifyEmail");
    const storedType = sessionStorage.getItem("verificationType") as
      | "registration"
      | "tfa"
      | null;

    if (storedEmail) {
      setEmail(storedEmail);
    }

    if (storedType) {
      setVerificationType(storedType);
    }
  }, []);

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
      // Determine which endpoint to use based on verification type
      const endpoint =
        verificationType === "registration"
          ? `/auth/verify/email`
          : `/auth/verify/authentication`;

      const response = await axiosInstance.post(endpoint, {
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

      // Different success messages based on verification type
      const successMessage =
        verificationType === "registration"
          ? "Email verified successfully! Welcome to PayMeFans!"
          : LOGIN_CONFIG.LOGIN_SUCCESSFUL_MSG;

      toast.success(successMessage);
      setUser(response.data.user);

      // Clear the stored email and type after successful verification
      sessionStorage.removeItem("verifyEmail");
      sessionStorage.removeItem("verificationType");

      router.push("/");
      return;
    } catch (error: any) {
      setLoading(false);
      console.log(error);
      setError(
        error?.response?.data?.message || error?.message || "An error occurred"
      );
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email not found. Please login again.");
      router.push("/login");
      return;
    }

    try {
      setResending(true);
      setError("");

      // Determine which endpoint to use based on verification type
      const endpoint =
        verificationType === "registration"
          ? `/auth/verify/email/resend`
          : `/auth/verify/resend`;

      const response = await axiosInstance.post(endpoint, {
        email: email,
      });

      if (response.data.error) {
        setResending(false);
        toast.error(response.data.message);
        return;
      }

      setResending(false);
      toast.success("Verification code resent successfully!");
    } catch (error: any) {
      setResending(false);
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to resend code"
      );
    }
  };

  const debounceSubmitLoginForm = debounce(submitLoginForm, 300);

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
              {verificationType === "registration"
                ? "Verify your email"
                : "Verify your account"}
            </h1>
            <p className="mb-6 text-gray-300 leading-relaxed">
              {verificationType === "registration"
                ? "We sent a verification code to your email. Enter the code below to verify your email and complete your registration."
                : "We sent a verification code to your email. Enter the code below to verify your account."}{" "}
              Check your spam folder if not received.
            </p>
          </div>

          <form
            action=""
            method="post"
            className="flex-1 w-full mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              setError("");
              debounceSubmitLoginForm(e);
            }}
          >
            <div className="flex flex-col mb-6 gap-2">
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
                className="block w-full px-4 py-3 text-xl font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 md:max-w-lg backdrop-blur-sm text-center tracking-widest"
                placeholder="000000"
              />
            </div>

            {(error || loading) && (
              <div className="mb-6 md:max-w-lg">
                {error && (
                  <p className="text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-2">
                    {error}
                  </p>
                )}
                {loading && <LoadingSpinner text="Verifying..." />}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-primary-dark-pink to-primary-dark-pink/80 md:max-w-lg hover:from-primary-dark-pink/90 hover:to-primary-dark-pink/70 transition-all duration-200 shadow-lg hover:shadow-primary-dark-pink/25 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {verificationType === "registration"
                ? "Verify Email"
                : "Verify Account"}
            </button>
          </form>

          <div className="flex items-center w-full mt-6 md:max-w-lg">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="ml-auto text-sm font-medium text-primary-dark-pink hover:text-primary-dark-pink/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? "Resending..." : "Resend Code"}
            </button>
          </div>

          <div className="mt-12">
            <p className="text-sm font-medium text-gray-300">
              Back to{" "}
              <Link
                href="/login"
                className="font-semibold text-primary-dark-pink hover:text-primary-dark-pink/80 transition-colors duration-200"
              >
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
