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
      <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-300 dark:border-gray-700">
        <div className="text-center mb-8">
          <Image
            src="/site/logo.svg"
            alt="PayMeFans Logo"
            width={120}
            height={25}
            className="mx-auto mb-4"
          />
          <div className="w-12 h-1 bg-red-500 mx-auto mb-4"></div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          Age Restricted Sensitive Content
        </h2>

        <div className="text-base text-gray-700 dark:text-gray-300 space-y-5">
          <p>
            Access to this website (Paymefans) is strictly regulated. By
            entering, you acknowledge that you have read, understood, and agree
            to comply with our Terms of Service.
          </p>

          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
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

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="text-red-500 hover:text-red-600 underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-red-500 hover:text-red-600 underline"
          >
            Privacy Policy
          </Link>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleCancelClick}
            className="px-8 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition transform hover:scale-105 duration-200 shadow-md cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => setAcceptedTerms(true)}
            className="px-8 py-2 bg-primary-dark-pink text-white font-semibold rounded-lg transition transform hover:scale-105 duration-200 shadow-md cursor-pointer"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentalGuide;
