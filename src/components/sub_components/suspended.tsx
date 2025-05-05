import React from "react";
import {
  MapPin,
  Calendar,
  MessageCircle,
  Image,
  Repeat,
  Lock,
} from "lucide-react";
import { ProfileUserProps } from "@/types/user";

const SuspendedUserPage = ({ userdata }: { userdata: ProfileUserProps }) => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-200 min-h-screen">
      {/* Profile Banner */}
      <div className="h-48 bg-gradient-to-r from-red-200 via-gray-200 to-red-100 flex items-center justify-center relative">
        <img
          src="/site/banner.png"
          alt="Default banner"
          className="opacity-40 w-full h-full object-cover absolute inset-0"
        />
        <div className="relative z-10 text-2xl font-semibold text-gray-700 drop-shadow">
          Suspended Account
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white relative pb-6 border-b border-gray-200 shadow-sm">
        {/* Avatar */}
        <div className="absolute -top-14 left-6">
          <div className="w-28 h-28 rounded-full border-4 border-red-500 bg-gray-100 flex items-center justify-center overflow-hidden shadow-lg">
            <svg
              className="w-14 h-14 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-6">
          <div className="flex items-center">
            <h2 className="font-bold text-2xl text-gray-800">
              {userdata?.name}
            </h2>
            <span className="ml-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow">
              Suspended
            </span>
          </div>
          <p className="text-gray-500 text-base mt-1">{userdata?.username}</p>

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

          <div className="flex mt-5 space-x-8 text-sm">
            <div className="flex gap-2 items-center">
              <span className="font-bold text-gray-800">
                {userdata?.total_followers || 0}
              </span>
              <span className="text-gray-500">Followers</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-bold text-gray-800">
                {userdata?.total_following || 0}
              </span>
              <span className="text-gray-500">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <button className="flex-1 py-3 text-purple-600 font-semibold border-b-2 border-purple-600 flex justify-center items-center transition-colors hover:bg-purple-50">
          <MessageCircle size={18} className="mr-2" />
          Posts
        </button>
        <button className="flex-1 py-3 text-gray-500 font-medium flex justify-center items-center transition-colors hover:bg-gray-100">
          <Image size={18} className="mr-2" />
          Media
        </button>
        <button className="flex-1 py-3 text-gray-500 font-medium flex justify-center items-center transition-colors hover:bg-gray-100">
          <Repeat size={18} className="mr-2" />
          Reposts
        </button>
        <button className="flex-1 py-3 text-gray-500 font-medium flex justify-center items-center transition-colors hover:bg-gray-100">
          <Lock size={18} className="mr-2" />
          Private
        </button>
      </div>

      {/* No Post Found */}
      <div className="py-24 text-center text-gray-500">
        <p className="text-lg font-medium">No Post Found</p>
        <p className="mt-3 text-base text-red-600 font-semibold">
          This account has been suspended
        </p>
      </div>
    </div>
  );
};

export default SuspendedUserPage;
