"use client";
import { Facebook, Instagram, LucideLoader, Twitter } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { PiSnapchatLogoDuotone } from "react-icons/pi";
import type {
  AuthUserProps,
  UserUpdateProfileType,
} from "@/features/user/types/user";
import { countries } from "@/lib/Locations";
import { saveUserSettings } from "@/utils/data/SaveUserSettings";
import useCheckUsername from "../../hooks/CheckUsername";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

type ProfileSettingsProps = {
  user: Partial<AuthUserProps> | null;
};

const ProfileSettings = ({ user }: ProfileSettingsProps) => {
  const router = useRouter();
  
  // Helper function to remove https:// or http:// prefix for display
  const removeHttpPrefix = (url: string): string => {
    if (!url) return "";
    return url.replace(/^https?:\/\//, "");
  };

  // Helper function to ensure https:// prefix for backend
  const ensureHttpPrefix = (url: string): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  const [userData, setUserData] = useState<UserUpdateProfileType>({
    name: user?.name || "",
    username: user?.username || "",
    location: user?.location || "",
    bio: user?.bio || "",
    state: user?.state || "",
    website: user?.website || "",
    instagram: removeHttpPrefix(user?.Settings?.instagram_url || ""),
    twitter: removeHttpPrefix(user?.Settings?.twitter_url || ""),
    facebook: removeHttpPrefix(user?.Settings?.facebook_url || ""),
    snapchat: removeHttpPrefix(user?.Settings?.snapchat_url || ""),
    tiktok: removeHttpPrefix(user?.Settings?.tiktok_url || ""),
    telegram: removeHttpPrefix(user?.Settings?.telegram_url || ""),
    youtube: removeHttpPrefix(user?.Settings?.youtube_url || ""),
  });
  const [usernameCheck, setUsernameCheck] = useState(user?.username || "");
  const { message, canSave, error, isLoading } = useCheckUsername(
    user!,
    usernameCheck,
  );

  const usernameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    
    // Social media fields - remove https:// prefix if pasted
    const socialFields = ['instagram', 'twitter', 'facebook', 'snapchat', 'tiktok', 'telegram', 'youtube'];
    if (socialFields.includes(name)) {
      const cleanValue = removeHttpPrefix(value);
      setUserData((prev) => ({ ...prev, [name]: cleanValue }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "username") {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
      usernameTimeoutRef.current = setTimeout(() => {
        setUsernameCheck(value);
      }, 300);
    }
  };

  const handleSaveClick = async () => {
    try {
      // Prepare data with https:// prefix for social links
      const dataToSend = {
        ...userData,
        instagram: userData.instagram ? ensureHttpPrefix(userData.instagram) : "",
        twitter: userData.twitter ? ensureHttpPrefix(userData.twitter) : "",
        facebook: userData.facebook ? ensureHttpPrefix(userData.facebook) : "",
        snapchat: userData.snapchat ? ensureHttpPrefix(userData.snapchat) : "",
        tiktok: userData.tiktok ? ensureHttpPrefix(userData.tiktok) : "",
        telegram: userData.telegram ? ensureHttpPrefix(userData.telegram) : "",
        youtube: userData.youtube ? ensureHttpPrefix(userData.youtube) : "",
      };

      const response = await saveUserSettings(dataToSend);
      if (response.status === 200) {
        toast.success("Profile updated successfully");
        router.refresh();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("An error occurred while updating profile");
    }
  };

  return (
    <div className="py-8 mx-auto bg-white dark:bg-black rounded-2xl">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) handleSaveClick();
        }}
        autoComplete="off"
      >
        <div>
          <label
            className="block mb-1 font-semibold text-gray-700 dark:text-gray-200"
            htmlFor="name"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-700 dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-dark-pink transition"
            value={userData.name}
            onChange={handleInputChange}
            placeholder="Name"
          />
        </div>
        <div>
          <label
            className="block mb-1 font-semibold text-gray-700 dark:text-gray-200"
            htmlFor="website"
          >
            State
          </label>
          <input
            id="state"
            type="text"
            className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-700 dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-dark-pink transition"
            placeholder="state"
            name="state"
            onChange={handleInputChange}
            value={userData.state || ""}
          />
        </div>
        <div>
          <label
            className="block mb-1 font-semibold text-gray-700 dark:text-gray-200"
            htmlFor="location"
          >
            Country
          </label>
          <select
            id="location"
            name="location"
            className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-700 dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-dark-pink transition"
            value={userData.location}
            onChange={handleInputChange}
          >
            <option value="">Select country</option>
            {countries.map((location) => (
              <option value={location.name} key={location.code}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block mb-1 font-semibold text-gray-700 dark:text-gray-200"
            htmlFor="username"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            className={`w-full border border-gray-300 dark:border-gray-700 p-3 outline-none text-black dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-dark-pink transition`}
            value={userData.username}
            onChange={handleInputChange}
            placeholder="Username"
          />
          {isLoading && (
            <div className={"py-2"}>
              <LoadingSpinner />
            </div>
          )}
          {error && (
            <p className="mt-1 text-sm font-medium text-red-500 dark:text-red-400">
              {message}
            </p>
          )}
        </div>
        {/*<div>
          <label
            className="block mb-1 font-semibold text-gray-700 dark:text-gray-200"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            disabled
            readOnly
            value={userData.email}
            className="w-full p-3 text-black bg-gray-100 border border-gray-300 rounded-lg outline-none select-none dark:border-gray-700 dark:text-white dark:bg-gray-800"
            placeholder="Email"
          />
        </div>*/}
        <div>
          <label
            className="block mb-1 font-semibold text-gray-700 dark:text-gray-200"
            htmlFor="bio"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg outline-none resize-none dark:border-gray-700 dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-dark-pink transition"
            placeholder="Tell us about yourself"
            onChange={handleInputChange}
            value={userData.bio || ""}
          ></textarea>
        </div>
        <div>
          <label
            className="block mb-1 font-semibold text-gray-700 dark:text-gray-200"
            htmlFor="website"
          >
            Website
          </label>
          <input
            id="website"
            type="text"
            className="w-full p-3 text-black bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-700 dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-dark-pink transition"
            placeholder="Website"
            name="website"
            onChange={handleInputChange}
            value={userData.website || ""}
          />
        </div>

        <div className="space-y-3">
          {/* Instagram */}
          <div className="items-center overflow-hidden border rounded-lg grid grid-cols-12 border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full py-3 col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 transition group-focus-within:bg-primary-dark-pink/20">
              <Instagram className="w-6 h-6 text-primary-dark-pink dark:text-white" />
            </div>
            <div className="flex items-center col-span-10">
              <span className="pl-3 text-sm text-gray-800 dark:text-white">https://</span>
              <input
                type="text"
                onChange={handleInputChange}
                name="instagram"
                value={userData.instagram}
                className="flex-1 p-3 pl-0 text-sm text-black bg-transparent border-none outline-none dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                placeholder="instagram.com/paymefans"
              />
            </div>
          </div>

          {/* Twitter */}
          <div className="items-center overflow-hidden border rounded-lg grid grid-cols-12 border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full py-3 col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 transition group-focus-within:bg-primary-dark-pink/20">
              <Twitter className="w-6 h-6 text-primary-dark-pink dark:text-white" />
            </div>
            <div className="flex items-center col-span-10">
              <span className="pl-3 text-sm text-gray-800 dark:text-white">https://</span>
              <input
                type="text"
                onChange={handleInputChange}
                name="twitter"
                value={userData.twitter}
                className="flex-1 p-3 pl-0 text-sm text-black bg-transparent border-none outline-none dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                placeholder="twitter.com/paymefans"
              />
            </div>
          </div>

          {/* Facebook */}
          <div className="items-center overflow-hidden border rounded-lg grid grid-cols-12 border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full py-3 col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 transition group-focus-within:bg-primary-dark-pink/20">
              <Facebook className="w-6 h-6 text-primary-dark-pink dark:text-white" />
            </div>
            <div className="flex items-center col-span-10">
              <span className="pl-3 text-sm text-gray-800 dark:text-white">https://</span>
              <input
                type="text"
                onChange={handleInputChange}
                name="facebook"
                value={userData.facebook}
                className="flex-1 p-3 pl-0 text-sm text-black bg-transparent border-none outline-none dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                placeholder="facebook.com/paymefans"
              />
            </div>
          </div>

          {/* Snapchat */}
          <div className="items-center overflow-hidden border rounded-lg grid grid-cols-12 border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full py-3 col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 transition group-focus-within:bg-primary-dark-pink/20">
              <PiSnapchatLogoDuotone
                className="w-6 h-6 text-primary-dark-pink dark:text-white"
                size={20}
              />
            </div>
            <div className="flex items-center col-span-10">
              <span className="pl-3 text-sm text-gray-800 dark:text-white">https://</span>
              <input
                type="text"
                onChange={handleInputChange}
                name="snapchat"
                value={userData.snapchat}
                className="flex-1 p-3 pl-0 text-sm text-black bg-transparent border-none outline-none dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                placeholder="snapchat.com/paymefans"
              />
            </div>
          </div>

          {/* TikTok */}
          <div className="items-center overflow-hidden border rounded-lg grid grid-cols-12 border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full py-3 col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 transition group-focus-within:bg-primary-dark-pink/20">
              <svg
                width="24"
                height="24"
                fill="currentColor"
                className="w-6 h-6 text-primary-dark-pink dark:text-white"
                viewBox="0 0 24 24"
              >
                <path d="M12.75 2h2.25a.75.75 0 0 1 .75.75v1.5a3.75 3.75 0 0 0 3.75 3.75h1.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-1.5A6.75 6.75 0 0 1 13.5 5.25V2.75A.75.75 0 0 1 12.75 2zm-2.25 5.25A6.75 6.75 0 1 0 17.25 14v-2.25a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0-.75.75v2.25a3.75 3.75 0 1 1-3.75-3.75h.75a.75.75 0 0 0 .75-.75V7.25a.75.75 0 0 0-.75-.75h-.75z" />
              </svg>
            </div>
            <div className="flex items-center col-span-10">
              <span className="pl-3 text-sm text-gray-800 dark:text-white">https://</span>
              <input
                type="text"
                onChange={handleInputChange}
                name="tiktok"
                value={userData.tiktok}
                className="flex-1 p-3 pl-0 text-sm text-black bg-transparent border-none outline-none dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                placeholder="tiktok.com/paymefans"
              />
            </div>
          </div>

          {/* Telegram */}
          <div className="items-center overflow-hidden border rounded-lg grid grid-cols-12 border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full py-3 col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 transition group-focus-within:bg-primary-dark-pink/20">
              <svg
                width="24"
                height="24"
                fill="currentColor"
                className="w-6 h-6 text-primary-dark-pink dark:text-white"
                viewBox="0 0 24 24"
              >
                <path d="M21.944 4.667a1.5 1.5 0 0 0-1.6-.217L3.6 11.25a1.5 1.5 0 0 0 .1 2.8l3.7 1.3 1.4 4.2a1.5 1.5 0 0 0 2.7.2l2-3.3 3.8 2.8a1.5 1.5 0 0 0 2.4-1l2-12a1.5 1.5 0 0 0-.756-1.583zM9.8 17.1l-1.1-3.3 7.2-6.5-6.1 7.7zm2.7 1.2l-1.1-3.3 2.7 2zm6.2-1.2-3.8-2.8 4.6-7.2z" />
              </svg>
            </div>
            <div className="flex items-center col-span-10">
              <span className="pl-3 text-sm text-gray-800 dark:text-white">https://</span>
              <input
                type="text"
                onChange={handleInputChange}
                name="telegram"
                value={userData.telegram}
                className="flex-1 p-3 pl-0 text-sm text-black bg-transparent border-none outline-none dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                placeholder="t.me/paymefans"
              />
            </div>
          </div>

          {/* YouTube */}
          <div className="items-center overflow-hidden border rounded-lg grid grid-cols-12 border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full py-3 col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 transition group-focus-within:bg-primary-dark-pink/20">
              <svg
                width="24"
                height="24"
                fill="currentColor"
                className="w-6 h-6 text-primary-dark-pink dark:text-white"
                viewBox="0 0 24 24"
              >
                <path d="M21.8 8.001a2.75 2.75 0 0 0-1.94-1.94C18.1 6 12 6 12 6s-6.1 0-7.86.06a2.75 2.75 0 0 0-1.94 1.94A28.2 28.2 0 0 0 2 12a28.2 28.2 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.94 1.94C5.9 18 12 18 12 18s6.1 0 7.86-.06a2.75 2.75 0 0 0 1.94-1.94A28.2 28.2 0 0 0 22 12a28.2 28.2 0 0 0-.2-3.999zM10 15.5v-7l6 3.5-6 3.5z" />
              </svg>
            </div>
            <div className="flex items-center col-span-10">
              <span className="pl-3 text-sm text-gray-800 dark:text-white">https://</span>
              <input
                type="text"
                onChange={handleInputChange}
                name="youtube"
                value={userData.youtube}
                className="flex-1 p-3 pl-0 text-sm text-black bg-transparent border-none outline-none dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                placeholder="youtube.com/paymefans"
              />
            </div>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={!canSave}
            className="w-full py-3 font-bold text-white rounded-lg cursor-pointer bg-primary-dark-pink hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
