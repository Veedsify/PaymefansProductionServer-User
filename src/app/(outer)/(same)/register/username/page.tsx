"use client";
import { LucideArrowLeft, LucideArrowRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useUser } from "@/lib/userContext";
import { useRouter } from "next/navigation";
import axiosServer from "@/utils/axios";
import swal from "sweetalert";
import axios from "axios";
import toast from "react-hot-toast";
import { REGISTER_CONFIG } from "@/config/config";

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

    try {
      const res = await axios(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/signup/username`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            username: ref.current?.value,
          },
        },
      );

      console.log(res.data);

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
      toast.loading(REGISTER_CONFIG.REGISTERING_MSG);
      try {
        if (ref.current?.value) {
          const createUser = await axios(
            `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/auth/signup`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              data: {
                fullname: user?.name,
                user_id: String(Math.floor(Math.random() * 1000000)),
                username: ref.current?.value,
                name: user?.name,
                email: user?.email,
                phone: user?.phone,
                location: user?.location,
                password: user?.password,
              },
            },
          );
          if (createUser.data.status === true) {
            setUser(null);
            await new Promise((resolve) => setTimeout(resolve, 500));
            toast.dismiss();
            toast.success(REGISTER_CONFIG.REGISTER_SUCCESSFUL_MSG);
            router.push("/login");
          }

          if (createUser.data.status === false) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            toast.dismiss();
            toast.error(createUser.data.message);
            return;
            // swal({
            //   title: "Error",
            //   text: createUser.data.message,
            //   icon: "error",
            //   buttons: {
            //     cancel: false,
            //     confirm: {
            //       text: "Ok",
            //       value: true,
            //       visible: true,
            //       className:
            //         "bg-primary-dark-pink text-white rounded-lg font-bold text-sm",
            //       closeModal: true,
            //     },
            //   },
            // });
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
    <div className="min-h-screen lg:p-0 bg-black p-5">
      <div className="lg:grid grid-cols-2 items-start justify-center mx-auto">
        <div className="min-h-screen hidden lg:block relative">
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
            <Link href="/">
              <Image
                width={150}
                height={150}
                priority
                src="/site/logo.svg"
                alt="Logo"
                className="h-auto"
              />
            </Link>
          </div>
          <div className="mb-3">
            <Link
              href="/register"
              className="text-white flex items-center gap-2 font-bold"
            >
              <LucideArrowLeft size={20} stroke="#CC0DF8" />
              Back
            </Link>
          </div>
          <div className="flex flex-col items-start justify-center max-w-screen-xl mx-auto">
            <h1 className="mt-auto mb-5 text-2xl font-bold text-white">
              Choose your Username
            </h1>
            <form
              onSubmit={createNewUser}
              action=""
              className="flex-1 w-full mb-5"
              autoComplete="false"
            >
              <div className="flex flex-col gap-3 mb-4 md:max-w-96">
                <div className="flex items-center gap-1 outline-white outline-1 rounded-lg px-3">
                  <input
                    onChange={checkForUsername}
                    ref={ref}
                    required
                    pattern="\S*"
                    type="text"
                    id="name"
                    className="block w-full py-3 font-bold text-white bg-transparent text-sm outline-none accent-primary-dark-pink"
                    placeholder="Username"
                  />
                  <div onClick={clearInput}>
                    <X
                      className="w-5 h-5 cursor-pointer"
                      stroke="#CC0DF8"
                      strokeWidth={3}
                      size={25}
                    />
                  </div>
                </div>
              </div>
              <div className={"py-2"}>
                {buttonActive && message ? (
                  <p className={"text-sm text-green-500"}>{message}</p>
                ) : (
                  <p className={"text-sm text-red-500"}>{message}</p>
                )}
              </div>
              <div>
                {buttonActive ? (
                  <button className="block w-full px-3 py-3 text-sm font-bold text-white rounded-lg bg-primary-dark-pink md:max-w-96 disabled:bg-gray-600">
                    Next
                  </button>
                ) : (
                  <button
                    disabled={true}
                    className="block w-full px-3 py-3 text-sm font-bold text-white rounded-lg md:max-w-96 bg-gray-600"
                  >
                    Next
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseUserName;
