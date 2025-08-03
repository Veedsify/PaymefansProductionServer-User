import React from "react";
import {
  MapPin,
  Calendar,
  Image as ImageIcon,
  MessageCircle,
  Repeat,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { ProfileUserProps } from "@/types/User";
import AccountSuspendedSupportTicket from "@/components/sub_components/sub/AccountSuspendedSupportTicket";

const SuspendedUserPage = ({ userdata }: { userdata: ProfileUserProps }) => {
  return (
    <>
      <div className="bg-gradient-to-b from-gray-50 to-gray-200 min-h-dvh">
        {/* Profile Banner */}
        <div className="relative flex items-center justify-center h-48 bg-gradient-to-r from-red-200 via-gray-200 to-red-100">
          <Image
            width={200}
            height={200}
            src="/site/banner.png"
            alt="Default banner"
            className="absolute inset-0 object-cover w-full h-full opacity-40"
          />
          <div className="relative z-10 text-2xl font-semibold text-gray-700 drop-shadow">
            Suspended Account
          </div>
        </div>

        {/* Profile Section */}
        <div className="relative pb-6 bg-white border-b border-gray-200 shadow-sm">
          {/* Avatar */}
          <div className="absolute -top-14 left-6">
            <div className="flex items-center justify-center overflow-hidden bg-gray-100 border-4 border-red-500 rounded-full shadow-lg w-28 h-28">
              <svg
                className="text-gray-400 w-14 h-14"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pt-20">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {userdata?.name}
              </h2>
              <span className="px-3 py-1 ml-3 text-xs font-semibold text-white bg-red-600 rounded-full shadow">
                Suspended
              </span>
            </div>
            <p className="mt-1 text-base text-gray-500">{userdata?.username}</p>

            <div className="flex items-center mt-3 text-gray-500 space-x-6">
              <span className="flex items-center">
                <MapPin size={16} className="mr-1" />
                <span className="text-sm">
                  {userdata?.location || "Location not available"}
                </span>
              </span>
              <span className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span className="text-sm">Joined</span>
              </span>
            </div>

            <div className="flex mt-5 text-sm space-x-8">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {userdata?.total_followers || 0}
                </span>
                <span className="text-gray-500">Followers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {userdata?.total_following || 0}
                </span>
                <span className="text-gray-500">Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sticky top-0 z-10 flex bg-white border-b border-gray-200 shadow-sm">
          <button className="flex items-center justify-center flex-1 py-3 font-semibold text-purple-600 border-b-2 border-purple-600 transition-colors hover:bg-purple-50">
            <MessageCircle size={18} className="mr-2" />
            Posts
          </button>
          <button className="flex items-center justify-center flex-1 py-3 font-medium text-gray-500 transition-colors hover:bg-gray-100">
            <ImageIcon size={18} className="mr-2" />
            Media
          </button>
          <button className="flex items-center justify-center flex-1 py-3 font-medium text-gray-500 transition-colors hover:bg-gray-100">
            <Repeat size={18} className="mr-2" />
            Reposts
          </button>
          <button className="flex items-center justify-center flex-1 py-3 font-medium text-gray-500 transition-colors hover:bg-gray-100">
            <Lock size={18} className="mr-2" />
            Private
          </button>
        </div>

        {/* No Post Found */}
        <div className="py-24 text-center text-gray-500">
          <p className="text-lg font-medium">No Post Found</p>
          <p className="mt-3 text-base font-semibold text-red-600">
            This account has been suspended
          </p>
        </div>
      </div>
    </>
  );
};

export default SuspendedUserPage;
