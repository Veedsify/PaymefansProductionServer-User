"use client";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { UserUpdateProfileType } from "@/types/user";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { saveUserSettings } from "@/utils/data/save-user-settings";
import axios from "axios";
import { getToken } from "@/utils/cookie.get";
import useCheckUsername from "../custom-hooks/check-username";
import { countries } from "@/lib/locations";

type ProfileSettingsProps = {
  user: any;
};

const ProfileSettings = ({ user }: ProfileSettingsProps) => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserUpdateProfileType>(
    {} as UserUpdateProfileType
  );
  const [usernameCheck, setUsernameCheck] = useState(user.username);
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const { message, canSave } = useCheckUsername(user, usernameCheck);

  const handleSaveClick = async () => {
    try {
      const email = userData.email || user.email;
      if (!email) {
        return toast.error("Email is required");
      }
      const regex = /^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regex.test(email)) {
        return toast.error("Invalid email address");
      }
      userData.email = email;
      const response = await saveUserSettings(userData);
      if (response.ok) {
        toast.success("Profile updated successfully");
        router.refresh();
      } else {
        console.log(response);
        return toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
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
            defaultValue={user?.name}
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
            defaultValue={user?.location}
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
            className={`w-full border p-3 outline-none text-black dark:text-white bg-white dark:bg-gray-800 rounded-lg transition ${
              message
                ? "border-red-400 dark:border-red-400"
                : "border-gray-300 dark:border-gray-700"
            } focus:ring-2 focus:ring-primary-dark-pink`}
            onChange={(e) => {
              setUsernameCheck(e.target.value);
              handleInputChange(e);
            }}
            defaultValue={user?.username}
            placeholder="Username"
          />
          {message && (
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
            defaultValue={user?.email}
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
            defaultValue={user?.bio || ""}
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
            defaultValue={user?.website || ""}
          />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-900">
              <Instagram className="text-pink-500" />
            </div>
            <input
              type="text"
              name="instagram"
              onChange={handleInputChange}
              className="flex-1 border-0 bg-transparent p-3 outline-none text-black dark:text-white"
              placeholder="Instagram profile link"
              defaultValue={user?.instagram || ""}
            />
          </div>
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-900">
              <Twitter className="text-sky-500" />
            </div>
            <input
              type="text"
              name="twitter"
              onChange={handleInputChange}
              className="flex-1 border-0 bg-transparent p-3 outline-none text-black dark:text-white"
              placeholder="Twitter profile link"
              defaultValue={user?.twitter || ""}
            />
          </div>
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-900">
              <Facebook className="text-blue-600" />
            </div>
            <input
              type="text"
              name="facebook"
              onChange={handleInputChange}
              className="flex-1 border-0 bg-transparent p-3 outline-none text-black dark:text-white"
              placeholder="Facebook profile link"
              defaultValue={user?.facebook || ""}
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
