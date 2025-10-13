"use client";
import { LucideInfo } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/contexts/UserUseContext";

const PaymentPage = () => {
  const { user } = useAuthContext();

  if (user?.is_model && user?.Model?.verification_status === true) {
    return (
      <>
        <div>
          <div className="p-8 px-12 m-3 rounded-2xl dark:text-white">
            <Image
              src="/icons/feeling_sorry.svg"
              width={300}
              height={300}
              alt="Sorry you are already a model"
              className="block w-3/5 mx-auto"
            />
            <div>
              <h1 className="mt-6 mb-8 text-2xl font-bold text-center md:text-3xl ">
                Sorry you are already a verified model <br /> on Paymefans
              </h1>
              <div className="text-center">
                <Link
                  href="/profile"
                  className="w-full px-4 py-3 m-3 text-sm font-bold text-center text-white bg-primary-dark-pink rounded-md"
                >
                  Go to Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else if (user?.is_model && user?.Model?.verification_status === false) {
    return (
      <>
        <div>
          <div className="p-8 px-12 m-3 rounded-2xl dark:text-white">
            <Image
              src="/icons/feeling_sorry.svg"
              width={300}
              height={300}
              alt="Sorry you are already a model"
              className="block w-1/5 mx-auto"
            />
            <div className="flex flex-col justify-center align-center">
              <h1 className="mt-6 mb-8 text-2xl font-bold text-center md:text-3xl ">
                You are not verified.
              </h1>
              <p className="text-center">
                You have already signed up as a model on Paymefans, <br />
                Please go to your verification center to complete your
                verification
              </p>
              <div className="text-center">
                <Link
                  href="/verification"
                  className="inline-block px-4 py-3 m-3 text-sm font-bold text-center text-white bg-primary-dark-pink rounded-md"
                >
                  Go to Verification
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div className="p-6 py-8 bg-white dark:bg-gray-950 rounded-2xl">
        <h1 className="block mb-6 text-2xl font-bold text-center text-primary-dark-pink md:hidden">
          Activate Creator Dashboard
        </h1>

        <div className="flex items-center max-w-md p-4 py-4 mx-auto mb-4 bg-coins-card-bottom md:max-w-2xl rounded-xl gap-4">
          <span>
            <LucideInfo className="text-primary-text-dark-pink" size={30} />
          </span>
          <p className="text-sm font-medium text-primary-text-dark-pink">
            Activate your creator dashboard to get premium access to Creator
            world and start monetizing your content
          </p>
        </div>
        <div className="max-w-md mx-auto mb-4 overflow-hidden bg-white shadow-lg dark:bg-gray-800 rounded-xl md:max-w-2xl">
          <div className="md:flex">
            <div className="w-full p-8">
              <div className="text-sm font-semibold tracking-wide uppercase text-primary-dark-pink">
                One-time payment
              </div>
              <h2 className="mt-1 text-3xl font-bold dark:text-white">
                Activate Creator Dashboard
              </h2>
              <div className="flex items-baseline mt-4 gap-1">
                <Image
                  width={80}
                  height={80}
                  src="/site/coin.svg"
                  className="w-auto h-8 aspect-square"
                  alt=""
                />
                <span className="text-5xl font-extrabold text-primary-dark-pink">
                  100
                </span>
                <span className="text-xl text-gray-500 dark:text-gray-400">
                  .00
                </span>
              </div>
              <div className="mt-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Start earning as a model
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Unlock all creator features
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Verification Check
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Premium profile visibility
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/models/become-a-model"
          className="block w-full max-w-md p-3 mx-auto mt-8 font-semibold text-center text-white shadow-md cursor-pointer bg-primary-dark-pink rounded-xl hover:bg-primary-dark-pink/90 transition md:max-w-2xl"
        >
          Continue
        </Link>
      </div>
    );
  }
};

export default PaymentPage;
