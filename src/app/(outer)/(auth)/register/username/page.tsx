"use client";
import { LucideArrowLeft, LucideArrowRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { REGISTER_CONFIG } from "@/config/config";
import { useUser } from "@/lib/UserContext";
import axiosInstance from "@/utils/Axios";

const ChooseUserName = () => {
    const router = useRouter();
    const ref = useRef<HTMLInputElement>(null);
    const [buttonActive, setButtonActive] = useState<boolean>(false);
    const [message, setMessage] = useState("");
    const { user, setUser } = useUser();
    const clearInput = () => {
        if (ref.current) {
            ref.current.value = "";
        }
    };

    function isValidUsername(username: string) {
        const regex = /^[a-zA-Z0-9_]{1,20}$/;
        return regex.test(username);
    }

    const checkForUsername = async () => {
        if (!ref.current?.value) {
            setButtonActive(false);
            setMessage("Username requires minimum 5 characters");
            return;
        }
        if (ref.current.value.length < 5) {
            setMessage("Username requires minimum 5 characters");
            setButtonActive(false);
            return;
        }

        if (ref.current.value.length > 20) {
            setMessage("Username cannot be more than 20 characters");
            setButtonActive(false);
            return;
        }

        if (!isValidUsername(ref.current.value)) {
            setMessage(
                "Username can only contain letters, numbers, and underscores",
            );
            setButtonActive(false);
            return;
        }

        try {
            const res = await axiosInstance.post(`/auth/signup/username`, {
                username: ref.current?.value,
            });

            if (res.data && res.data.status) {
                setMessage(res.data.message);
                setButtonActive(true);
                return;
            }
        } catch (error: any) {
            setButtonActive(false);
            setMessage(error.response.data.message || "Sorry an error occured");
        }
    };

    const createNewUser = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            toast.loading(REGISTER_CONFIG.REGISTERING_MSG, {
                id: "register",
            });
            try {
                if (ref.current?.value) {
                    const response = await axiosInstance.post(`/auth/signup`, {
                      username: ref.current?.value,
                      name: user?.name,
                      email: user?.email,
                      phone: user?.phone,
                      location: user?.location,
                      password: user?.password,
                    });

                    const registrationData = response.data;
                    // Handle email verification flow for new registrations
                    if (
                      registrationData &&
                      registrationData.requiresVerification &&
                      registrationData.email &&
                      registrationData.error === false
                    ) {
                      toast.success(
                        "Account created! Please check your email for verification code.",
                        {
                          id: "register",
                        }
                      );
                      setUser(null);
                      localStorage.setItem(
                        "verifyEmail",
                        registrationData.email
                      );
                      router.push("/verify-email");
                      return;
                    } else {
                      toast.error(
                        registrationData.message ||
                          "Registration failed. Please try again.",
                        { id: "register" }
                      );
                      return;
                    }
                }
            } catch (err) {
                return swal({
                    title: "Error",
                    text: "Sorry an error occured",
                    icon: "error",
                    buttons: {
                        cancel: false,
                        confirm: {
                            text: "Ok",
                            value: true,
                            visible: true,
                            className:
                                "bg-primary-dark-pink text-white rounded-lg font-bold text-sm",
                            closeModal: true,
                        },
                    },
                });
            }
        },
        [user, router, setUser],
    );

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
                  src="/site/logos/logo1.png"
                  alt="Logo"
                  className="h-auto w-[150px]"
                />
              </Link>
            </div>

            <div className="mb-6">
              <Link
                href="/register"
                className="inline-flex items-center font-medium text-gray-300 hover:text-white transition-colors duration-200 gap-2"
              >
                <LucideArrowLeft size={18} className="text-primary-dark-pink" />
                Back to registration
              </Link>
            </div>

            <div className="flex flex-col items-start justify-center mx-auto max-w-screen-xl">
              <div className="max-w-lg mb-8">
                <h1 className="mb-2 text-3xl font-bold text-white">
                  Choose your username
                </h1>
                <p className="text-gray-300">
                  This will be your unique identifier on the platform
                </p>
              </div>

              <form
                onSubmit={createNewUser}
                action=""
                className="flex-1 w-full mb-6"
                autoComplete="false"
              >
                <div className="flex flex-col mb-6 gap-2 md:max-w-96">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-300"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <input
                      onChange={checkForUsername}
                      ref={ref}
                      required
                      pattern="\S*"
                      type="text"
                      id="username"
                      name="username"
                      className="block w-full px-4 py-3 pr-12 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 backdrop-blur-sm"
                      placeholder="Enter your username"
                    />
                    <button
                      type="button"
                      onClick={clearInput}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-dark-pink hover:text-primary-dark-pink/70 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {message && (
                  <div className="mb-6 md:max-w-96">
                    <p
                      className={`text-sm font-medium px-3 py-2 rounded-lg border ${
                        buttonActive
                          ? "text-green-400 bg-green-400/10 border-green-400/20"
                          : "text-red-400 bg-red-400/10 border-red-400/20"
                      }`}
                    >
                      {message}
                    </p>
                  </div>
                )}

                <div className="md:max-w-96">
                  <button
                    type="submit"
                    disabled={!buttonActive}
                    className={`block w-full px-4 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-lg ${
                      buttonActive
                        ? "bg-gradient-to-r from-primary-dark-pink to-primary-dark-pink/80 hover:from-primary-dark-pink/90 hover:to-primary-dark-pink/70 hover:shadow-primary-dark-pink/25 hover:shadow-xl active:scale-[0.98]"
                        : "bg-gray-600 cursor-not-allowed opacity-50"
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ChooseUserName;
