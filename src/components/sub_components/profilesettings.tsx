"use client";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { UserUpdateProfileType } from "@/types/user";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { saveUserSettings } from "@/utils/data/save-user-settings";
import { countries } from "@/lib/locations";
import { PiSnapchatLogoDuotone } from "react-icons/pi";
import useCheckUsername from "../custom-hooks/check-username";

type ProfileSettingsProps = {
  user: any;
};

const ProfileSettings = ({ user }: ProfileSettingsProps) => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserUpdateProfileType>({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    location: user?.location || "",
    bio: user?.bio || "",
    website: user?.website || "",
    instagram: user?.Settings?.instagram_url || "",
    twitter: user?.Settings?.twitter_url || "",
    facebook: user?.Settings?.facebook_url || "",
    snapchat: user?.Settings?.snapchat_url || "",
    tiktok: user?.Settings?.tiktok_url || "",
    telegram: user?.Settings?.telegram_url || "",
    youtube: user?.Settings?.youtube_url || "",
  });
  const [usernameCheck, setUsernameCheck] = useState(user?.username || "");
  const { message, canSave, error } = useCheckUsername(user, usernameCheck);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    if (name === "username") {
      setUsernameCheck(value);
    }
  };

  const handleSaveClick = async () => {
    try {
      if (!userData.email) {
        return toast.error("Email is required");
      }
      const regex = /^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regex.test(userData.email)) {
        return toast.error("Invalid email address");
      }
      const response = await saveUserSettings(userData);
      if (response.ok) {
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
    <div className="py-8 mx-auto bg-white dark:bg-gray-900 rounded-2xl">
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
            className="w-full border border-gray-300 dark:border-gray-700 p-3 outline-none text-black dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-dark-pink transition"
            value={userData.name}
            onChange={handleInputChange}
            placeholder="Name"
          />
        </div>
        <div>
          <label
            className="block mb-1 font-semibold text-gray-700 dark:text-gray-200"
            htmlFor="location"
          >
            Location
          </label>
          <select
            id="location"
            name="location"
            className="w-full border border-gray-300 dark:border-gray-700 p-3 outline-none text-black dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-dark-pink transition"
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
          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 font-medium">
              {message}
            </p>
          )}
        </div>
        <div>
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
            className="w-full select-none border border-gray-300 dark:border-gray-700 p-3 outline-none text-black dark:text-white rounded-lg bg-gray-100 dark:bg-gray-800"
            placeholder="Email"
          />
        </div>
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
            className="resize-none w-full outline-none border border-gray-300 dark:border-gray-700 p-3 text-black dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-dark-pink transition"
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
            className="w-full border border-gray-300 dark:border-gray-700 p-3 outline-none text-black dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-dark-pink transition"
            placeholder="Website"
            name="website"
            onChange={handleInputChange}
            value={userData.website || ""}
          />
        </div>
        <div className="space-y-3">
          {/* Instagram */}
          <div className="grid grid-cols-12 items-center rounded-lg border border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-hidden transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 py-3 transition group-focus-within:bg-primary-dark-pink/20">
              <Instagram className="text-primary-dark-pink dark:text-white w-6 h-6" />
            </div>
            <input
              type="text"
              onChange={handleInputChange}
              name="instagram"
              value={userData.instagram}
              className="col-span-10 p-3 text-black dark:text-white bg-transparent border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition"
              placeholder="https://instagram.com/@paymefans"
            />
          </div>

          {/* Twitter */}
          <div className="grid grid-cols-12 items-center rounded-lg border border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-hidden transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 py-3 transition group-focus-within:bg-primary-dark-pink/20">
              <Twitter className="text-primary-dark-pink dark:text-white w-6 h-6" />
            </div>
            <input
              type="text"
              onChange={handleInputChange}
              name="twitter"
              value={userData.twitter}
              className="col-span-10 p-3 text-black dark:text-white bg-transparent border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition"
              placeholder="https://twitter.com/@paymefans"
            />
          </div>

          {/* Facebook */}
          <div className="grid grid-cols-12 items-center rounded-lg border border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-hidden transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 py-3 transition group-focus-within:bg-primary-dark-pink/20">
              <Facebook className="text-primary-dark-pink dark:text-white w-6 h-6" />
            </div>
            <input
              type="text"
              onChange={handleInputChange}
              name="facebook"
              value={userData.facebook}
              className="col-span-10 p-3 text-black dark:text-white bg-transparent border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition"
              placeholder="https://facebook.com/@paymefans"
            />
          </div>

          {/* Snapchat */}
          <div className="grid grid-cols-12 items-center rounded-lg border border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-hidden transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 py-3 transition group-focus-within:bg-primary-dark-pink/20">
              <PiSnapchatLogoDuotone className="text-primary-dark-pink dark:text-white w-6 h-6" size={20} />
            </div>
            <input
              type="text"
              onChange={handleInputChange}
              name="snapchat"
              value={userData.snapchat}
              className="col-span-10 p-3 text-black dark:text-white bg-transparent border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition"
              placeholder="https://snapchat.com/@paymefans"
            />
          </div>

          {/* TikTok */}
          <div className="grid grid-cols-12 items-center rounded-lg border border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-hidden transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 py-3 transition group-focus-within:bg-primary-dark-pink/20">
              <svg width="24" height="24" fill="currentColor" className="text-primary-dark-pink dark:text-white w-6 h-6" viewBox="0 0 24 24">
                <path d="M12.75 2h2.25a.75.75 0 0 1 .75.75v1.5a3.75 3.75 0 0 0 3.75 3.75h1.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-1.5A6.75 6.75 0 0 1 13.5 5.25V2.75A.75.75 0 0 1 12.75 2zm-2.25 5.25A6.75 6.75 0 1 0 17.25 14v-2.25a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0-.75.75v2.25a3.75 3.75 0 1 1-3.75-3.75h.75a.75.75 0 0 0 .75-.75V7.25a.75.75 0 0 0-.75-.75h-.75z" />
              </svg>
            </div>
            <input
              type="text"
              onChange={handleInputChange}
              name="tiktok"
              value={userData.tiktok}
              className="col-span-10 p-3 text-black dark:text-white bg-transparent border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition"
              placeholder="https://tiktok.com/@paymefans"
            />
          </div>

          {/* Telegram */}
          <div className="grid grid-cols-12 items-center rounded-lg border border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-hidden transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 py-3 transition group-focus-within:bg-primary-dark-pink/20">
              <svg width="24" height="24" fill="currentColor" className="text-primary-dark-pink dark:text-white w-6 h-6" viewBox="0 0 24 24">
                <path d="M21.944 4.667a1.5 1.5 0 0 0-1.6-.217L3.6 11.25a1.5 1.5 0 0 0 .1 2.8l3.7 1.3 1.4 4.2a1.5 1.5 0 0 0 2.7.2l2-3.3 3.8 2.8a1.5 1.5 0 0 0 2.4-1l2-12a1.5 1.5 0 0 0-.756-1.583zM9.8 17.1l-1.1-3.3 7.2-6.5-6.1 7.7zm2.7 1.2l-1.1-3.3 2.7 2zm6.2-1.2-3.8-2.8 4.6-7.2z" />
              </svg>
            </div>
            <input
              type="text"
              onChange={handleInputChange}
              name="telegram"
              value={userData.telegram}
              className="col-span-10 p-3 text-black dark:text-white bg-transparent border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition"
              placeholder="https://t.me/paymefans"
            />
          </div>

          {/* YouTube */}
          <div className="grid grid-cols-12 items-center rounded-lg border border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-hidden transition-shadow focus-within:shadow-md group">
            <div className="flex items-center justify-center h-full col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 py-3 transition group-focus-within:bg-primary-dark-pink/20">
              <svg width="24" height="24" fill="currentColor" className="text-primary-dark-pink dark:text-white w-6 h-6" viewBox="0 0 24 24">
                <path d="M21.8 8.001a2.75 2.75 0 0 0-1.94-1.94C18.1 6 12 6 12 6s-6.1 0-7.86.06a2.75 2.75 0 0 0-1.94 1.94A28.2 28.2 0 0 0 2 12a28.2 28.2 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.94 1.94C5.9 18 12 18 12 18s6.1 0 7.86-.06a2.75 2.75 0 0 0 1.94-1.94A28.2 28.2 0 0 0 22 12a28.2 28.2 0 0 0-.2-3.999zM10 15.5v-7l6 3.5-6 3.5z" />
              </svg>
            </div>
            <input
              type="text"
              onChange={handleInputChange}
              name="youtube"
              value={userData.youtube}
              className="col-span-10 p-3 text-black dark:text-white bg-transparent border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition"
              placeholder="https://youtube.com/@paymefans"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={!canSave}
            className="w-full bg-primary-dark-pink hover:bg-pink-700 transition text-white font-bold py-3 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;