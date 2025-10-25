"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ParentalGuideProps {
  setAcceptedTerms: (accepted: boolean) => void;
}
const ParentalGuide = ({ setAcceptedTerms }: ParentalGuideProps) => {
  const router = useRouter();
  const handleCancelClick = () => {
    router.push("https://google.com");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg p-5 max-h-[450px] overflow-y-scroll py-6 md:p-10 mx-4 bg-white border border-gray-300 shadow-2xl dark:bg-gray-800r rounded-xl md:rounded-2xl dark:border-gray-700">
        <div className="mb-8 text-center">
          <Image
            src="/site/logo.svg"
            alt="PayMeFans Logo"
            width={120}
            height={25}
            className="mx-auto mb-4"
          />
          <div className="w-12 h-1 mx-auto mb-4 bg-red-500"></div>
        </div>

        <h2 className="mb-4 md:text-2xl font-bold text-center text-gray-800 dark:text-white">
          Age Restricted Sensitive Content
        </h2>

        <div className="text-sm md:text-base text-gray-700 dark:text-gray-300 space-y-5">
          <p>
            Access to this website (Paymefans) is strictly regulated. By
            entering, you acknowledge that you have read, understood, and agree
            to comply with our Terms of Service.
          </p>

          <div>
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-white">
              Age Restriction:
            </h3>
            <p>
              You must be at least 18 years old (or the age of majority in your
              location) to access this website. By clicking &apos;Enter&apos;,
              you certify under penalty of perjury that you meet this age
              requirement.
            </p>
          </div>
        </div>

        <div className="mt-6 text-xs md:text-sm text-center text-gray-600 dark:text-gray-400">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="text-red-500 underline hover:text-red-600"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-red-500 underline hover:text-red-600"
          >
            Privacy Policy
          </Link>
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <button
            onClick={handleCancelClick}
            className="md:px-8 md:py-2 px-6 py-1 text-sm font-semibold text-white bg-gray-500 rounded-lg shadow-md cursor-pointer hover:bg-gray-600 transition transform hover:scale-105 duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => setAcceptedTerms(true)}
            className="md:px-8 md:py-2 px-6 py-1 text-sm font-semibold text-white rounded-lg shadow-md cursor-pointer bg-primary-dark-pink transition transform hover:scale-105 duration-200"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentalGuide;
