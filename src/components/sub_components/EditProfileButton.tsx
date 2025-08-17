"use client";
import { UserUpdateProfileType } from "@/types/User";
import axios from "axios";
import {
  Facebook,
  Instagram,
  LucideCamera,
  LucideInstagram,
  LucideLoader2,
  Twitter,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import BannerComponent from "../lib_components/BannerComponent";
import { getToken } from "@/utils/Cookie";
import { PROFILE_CONFIG } from "@/config/config";
import ROUTE from "@/config/routes";
import { BannerModalProps } from "@/types/Components";
import { countries } from "@/lib/Locations";
import { PiSnapchatLogoDuotone } from "react-icons/pi";
import useCheckUsername from "../custom-hooks/CheckUsername";
import axiosInstance from "@/utils/Axios";

const EditProfileButton = ({ user }: { user: any }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 text-sm font-semibold text-white bg-black border border-black rounded cursor-pointer sm:px-4 dark:bg-primary-dark-pink text-color"
      >
        Edit Profile
      </button>
      <BannerModal open={open} setOpen={setOpen} user={user} />
    </div>
  );
};

function BannerModal({ user, open = false, setOpen }: BannerModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [userData, setUserData] = useState<UserUpdateProfileType>(
    {} as UserUpdateProfileType,
  );
  const [usernameCheck, setUsernameCheck] = useState("");
  const { message, canSave, error, isLoading } = useCheckUsername(
    user,
    usernameCheck,
  );

  const usernameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    if (e.target.name === "bio") {
      if (e.target.value.length > 1000) {
        toast.error("Bio cannot exceed 1000 characters.");
        return;
      }
    }
    if (e.target.name === "username") {
      if (e.target.value.length > 20) {
        toast.error("Username cannot exceed 20 characters.");
        return;
      }
    }
    const { name, value } = e.target;
    if (name === "username") {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
      usernameTimeoutRef.current = setTimeout(() => {
        setUsernameCheck(value);
      }, 300);
    }
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    setUserData((prev) => {
      return { ...prev, email: user?.email };
    });
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) {
      if (e.currentTarget.files[0].size > 5 * 1024 * 1024) {
        toast.error("File size cannot exceed 5MB.");
        return;
      }
      if(!e.currentTarget.files[0].type.startsWith("image/")) {
        toast.error("Only image files are allowed.");
        return;
      }
      setFile(e.currentTarget.files?.[0]);
      setUserData({ ...userData, profile_image: e.currentTarget.files?.[0] });
    }
  };

  const handleSaveClick = async () => {
    if (userData.bio && userData.bio.length > 1000) {
      toast.error("Bio cannot exceed 1000 characters.", {
        id: "profile-update-toast",
      });
      return;
    }

    const formData = new FormData();
    for (const key in userData) {
      if (Object.prototype.hasOwnProperty.call(userData, key)) {
        const value = userData[key as keyof UserUpdateProfileType] as
          | string
          | File;
        formData.append(key, value);
      }
    }
    try {
      const updateProfile = async (formData: FormData) => {
        const response = await axiosInstance.post(
          ROUTE.PROFILE_UPDATE,
          formData,
        );
        setOpen(false);
        router.refresh();
        return response;
      };

      toast.promise(
        updateProfile(formData),
        {
          loading: PROFILE_CONFIG.PROFILE_UPDATING_MSG,
          success: PROFILE_CONFIG.PROFILE_UPDATED_SUCCESS_MSG,
          error: PROFILE_CONFIG.PROFILE_UPDATED_ERROR_MSG,
        },
        {
          id: "profile-update-toast",
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      className={`fixed inset-0 w-full h-full bg-white dark:bg-gray-950 z-[250] flex items-center justify-center transition-all duration-300 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="relative w-full p-6 overflow-y-auto bg-white rounded-none dark:bg-slate-950 lg:max-w-6xl md:rounded md:p-8 h-dvh lg:h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute text-gray-500 cursor-pointer transition-colors top-4 right-4 hover:text-primary-dark-pink"
          onClick={() => setOpen(false)}
          aria-label="Close"
          type="button"
        >
          <X size={28} />
        </button>
        <h1 className="mb-6 text-2xl font-bold text-center dark:text-white">
          Edit Profile
        </h1>
        <div className="flex justify-center mb-5 lg:justify-start rounded-xl">
          <BannerComponent
            profile_banner={user ? user.profile_banner : "/site/banner.png"}
          />
        </div>
        <div className="flex flex-col items-center mb-6 lg:items-start">
          <label
            htmlFor="imageUpload"
            className="relative cursor-pointer group"
          >
            <div className="relative inline-block p-1 mb-2 overflow-hidden border-4 border-dotted rounded-full transition-all border-black/40 dark:border-slate-700 group-hover:border-primary-dark-pink">
              <Image
                src={
                  file
                    ? URL.createObjectURL(file)
                    : user?.profile_image || "/site/avatar.png"
                }
                alt=""
                width={96}
                height={96}
                className="object-cover w-24 h-24 rounded-full aspect-square"
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full transition-opacity opacity-70 bg-black/30 group-hover:opacity-100">
                <LucideCamera size={22} className="text-white" />
              </div>
            </div>
          </label>
          <input
            onChange={handleFileChange}
            type="file"
            accept={"image/*"}
            pattern="image/*"
            id="imageUpload"
            className="hidden"
          />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) {
              handleSaveClick();
            }
          }}
          className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-8"
        >
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Personal Information
            </h2>
            <input
              type="text"
              onChange={handleInputChange}
              name="name"
              defaultValue={user?.name}
              className="w-full p-3 text-black border border-gray-300 rounded-lg outline-none dark:text-white dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-primary-dark-pink"
              placeholder="Name"
            />
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
                defaultValue={user?.username}
                className={`w-full border border-gray-300 dark:border-gray-700 p-3 outline-none text-black dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-dark-pink transition`}
                onChange={handleInputChange}
                placeholder="Username"
              />
              {isLoading && (
                <div className={"py-2"}>
                  <LucideLoader2
                    size={10}
                    className={"animate-spin text-primary-dark-pink"}
                  />
                </div>
              )}
              {error && (
                <p className="mt-1 text-sm font-medium text-red-500 dark:text-red-400">
                  {message}
                </p>
              )}
            </div>
            <select
              name="location"
              className="w-full p-3 text-black border border-gray-300 rounded-lg outline-none dark:text-white dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-primary-dark-pink"
              defaultValue={user?.location}
              onChange={handleInputChange}
            >
              {countries.map((location) => (
                <option value={location.name} key={location.code}>
                  {location.name}
                </option>
              ))}
            </select>
            <input
              type="email"
              defaultValue={user?.email ? user?.email : ""}
              className="hidden w-full p-3 mb-3 text-black border border-gray-300 rounded-lg outline-none select-none dark:text-white dark:bg-slate-900 dark:border-slate-700 cursor-none"
              name="email"
              readOnly
              onChange={handleInputChange}
              placeholder="Email"
            />
            <textarea
              name="bio"
              maxLength={1000}
              rows={4}
              onChange={handleInputChange}
              className="w-full p-3 text-black border border-gray-300 rounded-lg outline-none resize-none dark:text-white dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-primary-dark-pink"
              placeholder="Bio"
              defaultValue={user?.bio ? user?.bio : ""}
            ></textarea>
            <input
              type="text"
              onChange={handleInputChange}
              name="website"
              defaultValue={user?.website ? user?.website : ""}
              className="w-full p-3 text-black border border-gray-300 rounded-lg outline-none dark:text-white dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-primary-dark-pink"
              placeholder="Website"
            />
          </div>
          {user.is_model && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Social Links
              </h2>
              {/* Instagram */}
              <div className="items-center overflow-hidden border rounded-lg grid grid-cols-12 border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 transition-shadow focus-within:shadow-md group">
                <div className="flex items-center justify-center h-full py-3 col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 transition group-focus-within:bg-primary-dark-pink/20">
                  <Instagram className="w-6 h-6 text-primary-dark-pink dark:text-white" />
                </div>
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="instagram"
                  defaultValue={String(user?.Settings?.instagram_url || "")}
                  className="p-3 text-sm text-black bg-transparent border-none outline-none col-span-10 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                  placeholder="https://instagram.com/@paymefans"
                />
              </div>

              {/* Twitter */}
              <div className="items-center overflow-hidden border rounded-lg grid grid-cols-12 border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 transition-shadow focus-within:shadow-md group">
                <div className="flex items-center justify-center h-full py-3 col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 transition group-focus-within:bg-primary-dark-pink/20">
                  <Twitter className="w-6 h-6 text-primary-dark-pink dark:text-white" />
                </div>
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="twitter"
                  defaultValue={String(user?.Settings?.twitter_url || "")}
                  className="p-3 text-sm text-black bg-transparent border-none outline-none col-span-10 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                  placeholder="https://twitter.com/@paymefans"
                />
              </div>

              {/* Facebook */}
              <div className="items-center overflow-hidden border rounded-lg grid grid-cols-12 border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 transition-shadow focus-within:shadow-md group">
                <div className="flex items-center justify-center h-full py-3 col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 transition group-focus-within:bg-primary-dark-pink/20">
                  <Facebook className="w-6 h-6 text-primary-dark-pink dark:text-white" />
                </div>
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="facebook"
                  defaultValue={String(user?.Settings?.facebook_url || "")}
                  className="p-3 text-sm text-black bg-transparent border-none outline-none col-span-10 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                  placeholder="https://facebook.com/@paymefans"
                />
              </div>

              {/* Snapchat */}
              <div className="items-center overflow-hidden border rounded-lg grid grid-cols-12 border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 transition-shadow focus-within:shadow-md group">
                <div className="flex items-center justify-center h-full py-3 col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 transition group-focus-within:bg-primary-dark-pink/20">
                  <PiSnapchatLogoDuotone
                    className="w-6 h-6 text-primary-dark-pink dark:text-white"
                    size={20}
                  />
                </div>
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="snapchat"
                  defaultValue={String(user?.Settings?.snapchat_url || "")}
                  className="p-3 text-sm text-black bg-transparent border-none outline-none col-span-10 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                  placeholder="https://snapchat.com/@paymefans"
                />
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
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="tiktok"
                  defaultValue={String(user?.Settings?.tiktok_url || "")}
                  className="p-3 text-sm text-black bg-transparent border-none outline-none col-span-10 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                  placeholder="https://tiktok.com/@paymefans"
                />
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
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="telegram"
                  defaultValue={String(user?.Settings?.telegram_url || "")}
                  className="p-3 text-sm text-black bg-transparent border-none outline-none col-span-10 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                  placeholder="https://t.me/paymefans"
                />
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
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="youtube"
                  defaultValue={String(user?.Settings?.youtube_url || "")}
                  className="p-3 text-sm text-black bg-transparent border-none outline-none col-span-10 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                  placeholder="https://youtube.com/@paymefans"
                />
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white rounded-lg shadow cursor-pointer transition-colors bg-primary-dark-pink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-primary-dark-pink col-span-2"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfileButton;
