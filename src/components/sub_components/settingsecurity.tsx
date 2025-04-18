"use client";
import {
  LucideChevronRight,
  LucideUserMinus2,
  LucideUsers,
} from "lucide-react";
import Link from "next/link";
import SettingsHookupCheck from "./settings-hookup-check";
import UpdatePasswords from "./update-password";
import { useUserAuthContext } from "@/lib/userUseContext";
import Toggle from "./checked";
import TwoFactorAuth from "./settings-two-factor-auth";

const SettingSecurity = () => {
  const { user } = useUserAuthContext();
  return (
    <div className="py-5">
      <h1 className="font-bold mb-4">Privacy</h1>
      <div>
        <Link
          className="flex gap-4 items-center border rounded-lg py-4 px-6 hover:bg-gray-100 transition-all duration-200 cursor-pointer mb-2"
          href="/settings/followers"
        >
          <span>
            <LucideUsers />
          </span>
          <span className="font-semibold">All Followers</span>
          <span className="ml-auto">
            <LucideChevronRight />
          </span>
        </Link>
        {user && user.is_model && (
          <Link
            className="flex gap-4 items-center border-green-500 border rounded-lg py-4 px-6 hover:bg-gray-100 transition-all duration-200 cursor-pointer mb-2"
            href="/settings/subscribers"
          >
            <span>
              <LucideUsers className="text-green-500" />
            </span>
            <span className="font-semibold text-green-500">
              Active Subscribers
            </span>
            <span className="ml-auto text-green-500">
              <LucideChevronRight />
            </span>
          </Link>
        )}

        <div className="flex gap-4 items-center border rounded-lg py-4 px-6 hover:bg-red-100 transition-all duration-200 cursor-pointer mb-2 text-red-500 border-red-300">
          <span>
            <LucideUserMinus2 />
          </span>
          <span className="font-semibold">Blocked Users</span>
          <span className="ml-auto">
            <LucideChevronRight />
          </span>
        </div>
        <div>
          <h2 className="mb-4 font-bold mt-10">Change Password</h2>
        </div>
        <UpdatePasswords />
        <SettingsHookupCheck />
        <TwoFactorAuth />
        <div>
          <h2 className="mb-4 font-bold mt-10">Change Email / Phone</h2>
          <p>
            to change your account email, please visit the help section or
            contact support:&nbsp;
            <a
              className="text-primary-dark-pink"
              href="mailto:support@paymefans.com"
            >
              support@paymefans.com
            </a>
          </p>
        </div>
        <div>
          <h2 className="mb-4 font-bold mt-10">Delete Account</h2>
          <p>
            to delete your account please contact support:&nbsp;
            <a
              className="text-primary-dark-pink"
              href="mailto:support@paymefans.com"
            >
              support@paymefans.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingSecurity;
