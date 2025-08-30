"use client";
import { useAuthContext } from "@/contexts/UserUseContext";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { AnimatePresence, motion } from "framer-motion";
import { LucideLoader, LucideLoader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
const DeleteAccount = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const handleDeleteClick = () => {
    setIsOpen(true);
  };
  const handleCancel = () => {
    setIsOpen(false);
    setPassword("");
    setPasswordError("");
  };
  const confirmDelete = async () => {
    // Validate password is entered
    if (!password.trim()) {
      setPasswordError("Password is required to confirm account deletion");
      return;
    }

    setPasswordError("");
    setIsDeleting(true);
    try {
      // Make sure to get the token before making the request
      const axios = (await import("axios")).default;
      try {
        const response = await axiosInstance.delete(`/profile/delete-account`, {
          data: { password },
        });
        // Handle successful deletion, e.g., redirect to home page or show success message
        window.location.href = "/login";
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Failed to delete account";
        toast.error(message);
      }
    } catch (error) {
      toast.error(
        "An error occurred while trying to delete your account. Please try again later.",
      );
    } finally {
      // Reset state after deletion attempt
      setIsDeleting(false);
      setIsOpen(false);
    }
  };
  return (
    <>
      <div className="mt-10">
        <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          Delete Account
        </h2>
        <div>
          <button
            onClick={handleDeleteClick}
            type="button"
            className="px-4 py-3 text-sm font-semibold text-white bg-red-500 rounded-lg cursor-pointer hover:bg-red-600 transition-colors"
          >
            Delete My Account
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bg-black/50 top-0 left-0 w-full h-full z-[999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-950">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
                Are you sure you want to delete your account?
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                This action cannot be undone. All your data will be permanently
                deleted.
              </p>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  placeholder="Enter your password"
                  disabled={isDeleting}
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordError}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-800 bg-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex items-center justify-center px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  disabled={isDeleting}
                >
                  Confirm Delete{" "}
                  {isDeleting && (
                    <span className="ml-2">
                      <LucideLoader2 className="w-4 h-4 animate-spin" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DeleteAccount;
