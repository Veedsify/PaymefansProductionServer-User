"use client";
import { countries } from "@/lib/locations";
import { useUserAuthContext } from "@/lib/userUseContext";
import {
  postAudienceDataProps,
  postAudienceDataProps2,
} from "@/types/components";
import { modelSignUp } from "@/utils/data/model-signup";
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEye,
  LucideInfo,
  LucideLoader,
  LucideUser,
  LucideUser2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PaymentPage = () => {
  const router = useRouter();
  const { user } = useUserAuthContext();

  if (user?.is_model && user?.Model?.verification_status === true) {
    return (
      <>
        <div>
          <div className="m-3 p-8 px-12 rounded-2xl dark:text-white">
            <Image
              src="/icons/feeling_sorry.svg"
              width={300}
              height={300}
              alt="Sorry you are already a model"
              className="w-3/5 mx-auto block"
            />
            <div>
              <h1 className="text-center mt-6 mb-8 font-bold md:text-3xl text-2xl ">
                Sorry you are already a verified model <br /> on Paymefans
              </h1>
              <div className="text-center">
                <Link
                  href="/profile"
                  className="bg-primary-dark-pink text-white text-sm py-3 px-4 font-bold m-3 rounded-md w-full text-center"
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
          <div className="m-3 p-8 px-12 rounded-2xl dark:text-white">
            <Image
              src="/icons/feeling_sorry.svg"
              width={300}
              height={300}
              alt="Sorry you are already a model"
              className="w-1/5 mx-auto block"
            />
            <div className="flex flex-col justify-center align-center">
              <h1 className="text-center mt-6 mb-8 font-bold md:text-3xl text-2xl ">
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
                  className="bg-primary-dark-pink inline-block text-white text-sm py-3 px-4 font-bold m-3 rounded-md text-center"
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
      <div className="py-8 bg-white dark:bg-gray-900 rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary-dark-pink md:hidden block">
          Activate Creator Dashboard
        </h1>

        <div className="bg-coins-card-bottom max-w-md mx-auto p-4 py-4 md:max-w-2xl mb-4 rounded-xl flex items-center gap-4">
          <span>
            <LucideInfo className="text-primary-text-dark-pink" size={30} />
          </span>
          <p className="text-sm font-medium text-primary-text-dark-pink">
            Activate your creator dashboard to get premium access to Creator
            world and start monetizing your content
          </p>
        </div>
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden md:max-w-2xl mb-4">
          <div className="md:flex">
            <div className="p-8 w-full">
              <div className="uppercase tracking-wide text-sm text-primary-dark-pink font-semibold">
                One-time payment
              </div>
              <h2 className="mt-1 text-3xl font-bold dark:text-white">
                Activate Creator Dashboard
              </h2>
              <div className="mt-4 flex items-baseline gap-1">
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
                      className="h-5 w-5 text-green-500 mr-2"
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
                      className="h-5 w-5 text-green-500 mr-2"
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
                      className="h-5 w-5 text-green-500 mr-2"
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
                      className="h-5 w-5 text-green-500 mr-2"
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
          className="bg-primary-dark-pink w-full block text-center p-3 mx-auto rounded-xl mt-8 text-white font-semibold shadow-md hover:bg-primary-dark-pink/90 transition cursor-pointer md:max-w-2xl max-w-md"
        >
          Continue
        </Link>
      </div>
    );
  }
};

export default PaymentPage;
