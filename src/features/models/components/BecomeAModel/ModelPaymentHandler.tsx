"use client";

import type React from "react";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

interface ModelPaymentHandlerProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

const ModelPaymentHandler: React.FC<ModelPaymentHandlerProps> = ({
  isSubmitting,
  onSubmit,
}) => {
  return (
    <button
      type="button"
      onClick={onSubmit}
      className="flex items-center justify-center w-full p-3 mt-8 font-semibold text-white shadow-md cursor-pointer bg-primary-dark-pink rounded-xl hover:bg-primary-dark-pink/90 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <LoadingSpinner className="ml-2" text="Processing payment..." />
      ) : (
        "Sign Up (₦10,000)"
      )}
    </button>
  );
};

export default ModelPaymentHandler;
