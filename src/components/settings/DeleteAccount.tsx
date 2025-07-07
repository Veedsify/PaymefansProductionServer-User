"use client";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { getToken } from "@/utils/Cookie";
import { AnimatePresence, motion } from "framer-motion";
import { LucideLoader, LucideLoader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
const DeleteAccount = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const token = getToken();
  const handleDeleteClick = () => {
    setIsOpen(true);
  };
  const handleCancel = () => {
    setIsOpen(false);
  };
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/profile/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (response.ok) {
        // Handle successful deletion, e.g., redirect to home page or show success message
        window.location.href = "/login";
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } else {
        const jsonResponse = await response.json();
        toast.error(jsonResponse.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error(
        "An error occurred while trying to delete your account. Please try again later."
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
        <h2 className="mb-2 font-bold text-lg text-gray-900 dark:text-gray-100">
          Delete Account
        </h2>
        <div>
          <button
            onClick={handleDeleteClick}
            type="button"
            className="bg-red-500 text-white px-4 py-3 rounded-lg cursor-pointer hover:bg-red-600 transition-colors text-sm font-semibold"
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
            <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Are you sure you want to delete your account?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                This action cannot be undone. All your data will be permanently
                deleted.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
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
