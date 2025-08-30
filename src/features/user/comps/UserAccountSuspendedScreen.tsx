"use client";
import {
  AlertCircle,
  Mail,
  ArrowLeft,
  HelpCircle,
  Phone,
  Loader2,
} from "lucide-react";
import LogoutButton from "@/components/common/global/LogOut";
import Link from "next/link";
import AccountSuspendedSupportTicket from "../../support/AccountSuspendedSupportTicket";
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
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 className="animate-spin text-primary-dark-pink" size={40} />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center bg-white dark:bg-gray-950 min-h-dvh">
        <div className="w-full overflow-hidden bg-white lg:max-w-md h-dvh lg:h-auto dark:bg-gray-800 lg:rounded-xl lg:shadow-lg">
          {/* Status Bar */}
          <div className="flex items-center px-6 py-3 bg-red-500">
            <AlertCircle className="mr-2 text-white" size={20} />
            <p className="font-medium text-white">Account Status: Suspended</p>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="flex items-center justify-center w-20 h-20 mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
                Your Account Has Been Suspended
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Your account has been found in violation of Paymefans&apos;
                Community Guidelines.
              </p>
            </div>

            {/* Information Box */}
            <div className="p-4 mb-6 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <h2 className="mb-2 font-semibold text-gray-800 dark:text-white">
                What does this mean?
              </h2>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• You cannot access your account or its features</li>
                <li>• Your profile is not visible to other users</li>
                <li>• Your data is still preserved and can be restored</li>
              </ul>
            </div>

            {/* Support Options */}
            <h2 className="mb-3 font-semibold text-gray-800 dark:text-white">
              Contact Support
            </h2>
            <div className="mb-6 space-y-3">
              <Link
                href="mailto:support@example.com"
                className="flex items-center p-3 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full dark:bg-blue-900/30">
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
                className="flex items-center justify-center w-full py-3 font-medium text-white rounded-lg cursor-pointer bg-primary-dark-pink hover:bg-primary-text-dark-pink transition"
              >
                <HelpCircle size={18} className="mr-2" />
                Request Reactivation
              </button>

              <LogoutButton
                user={user}
                buttonNode={
                  <span className="flex items-center justify-center w-full py-3 font-medium text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-700">
                    <ArrowLeft size={18} className="mr-2" />
                    Logout
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>
      <AccountSuspendedSupportTicket open={open} close={handleClose} user={user} />
    </>
  );
};

export default UserAccountSupendedScreen;
