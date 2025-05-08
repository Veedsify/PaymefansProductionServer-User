"use client";
import {
  AlertCircle,
  Mail,
  ArrowLeft,
  HelpCircle,
  Phone,
  Loader2,
} from "lucide-react";
import LogoutButton from "@/components/sub_components/sub/logout";
import Link from "next/link";
import SuspendedSupportTicketForm from "./sub/suspended-support-ticket-form";
import React, { useEffect } from "react";
const UserAccountSupendedScreen = ({ user }: { user: any }) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary-dark-pink" size={40} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="lg:max-w-md w-full h-screen lg:h-auto bg-white dark:bg-gray-800 lg:rounded-xl lg:shadow-lg overflow-hidden">
          {/* Status Bar */}
          <div className="bg-red-500 px-6 py-3 flex items-center">
            <AlertCircle className="text-white mr-2" size={20} />
            <p className="text-white font-medium">Account Status: Suspended</p>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Your Account Has Been Suspended
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Your account has been found in violation of Paymefans' Community
                Guidelines.
              </p>
            </div>

            {/* Information Box */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-gray-800 dark:text-white mb-2">
                What does this mean?
              </h2>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• You cannot access your account or its features</li>
                <li>• Your profile is not visible to other users</li>
                <li>• Your data is still preserved and can be restored</li>
              </ul>
            </div>

            {/* Support Options */}
            <h2 className="font-semibold text-gray-800 dark:text-white mb-3">
              Contact Support
            </h2>
            <div className="space-y-3 mb-6">
              <Link
                href="mailto:support@example.com"
                className="flex items-center p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                  <Mail size={18} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-white">
                    Email Support
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    support@example.com
                  </p>
                </div>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleOpen}
                className="w-full py-3 bg-primary-dark-pink hover:bg-primary-text-dark-pink text-white font-medium rounded-lg transition flex cursor-pointer items-center justify-center"
              >
                <HelpCircle size={18} className="mr-2" />
                Request Reactivation
              </button>

              <LogoutButton
                user={user}
                buttonNode={
                  <span className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700">
                    <ArrowLeft size={18} className="mr-2" />
                    Logout
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>
      <SuspendedSupportTicketForm open={open} close={handleClose} user={user} />
    </>
  );
};

export default UserAccountSupendedScreen;
