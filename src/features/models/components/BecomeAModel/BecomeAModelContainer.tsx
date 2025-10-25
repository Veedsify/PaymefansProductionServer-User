"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { useModelSignup } from "../../hooks/useModelSignup";
import ModelSignupForm from "./ModelSignupForm";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

export const BecomeAModelContainer: React.FC = () => {
  const {
    formData,
    isSubmitting,
    isPageLoading,
    formErrors,
    focusedField,
    userStatus,
    handleInputChange,
    handleFocus,
    handleBlur,
    handleSubmit,
  } = useModelSignup();

  // Render loading state
  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center h-[30dvh]">
        <LoadingSpinner className="animate-spin" size={"lg"} />
      </div>
    );
  }

  // Render verified model state
  if (userStatus === "verified") {
    return (
      <div className="p-8 px-12 m-3 rounded-2xl dark:text-white">
        <Image
          src="/icons/feeling_sorry.svg"
          width={300}
          height={300}
          alt="Already verified model"
          className="block w-3/5 mx-auto"
        />
        <div>
          <h1 className="mt-6 mb-8 text-2xl font-bold text-center md:text-3xl">
            You&apos;re already a verified model on Paymefans
          </h1>
          <div className="text-center">
            <Link
              href="/profile"
              className="inline-block px-4 py-3 m-3 text-sm font-bold text-white bg-primary-dark-pink rounded-md"
            >
              Go to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render unverified model state
  if (userStatus === "unverified") {
    return (
      <div className="p-8 px-12 m-3 rounded-2xl dark:text-white">
        <Image
          src="/icons/feeling_sorry.svg"
          width={300}
          height={300}
          alt="Unverified model"
          className="block w-1/5 mx-auto"
        />
        <div className="flex flex-col items-center justify-center">
          <h1 className="mt-6 mb-8 text-2xl font-bold text-center md:text-3xl">
            Verification Pending
          </h1>
          <p className="mb-6 text-center">
            You&apos;ve already signed up as a model on Paymefans.
            <br />
            Please complete your verification to start earning.
          </p>
          <Link
            href="/verification"
            className="px-4 py-3 text-sm font-bold text-white bg-primary-dark-pink rounded-md"
          >
            Complete Verification
          </Link>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <ModelSignupForm
      formData={formData}
      formErrors={formErrors}
      focusedField={focusedField}
      isSubmitting={isSubmitting}
      onInputChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSubmit={handleSubmit}
    />
  );
};

export default BecomeAModelContainer;
