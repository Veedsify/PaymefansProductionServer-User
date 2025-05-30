"use client";
import { UserUpdateProfileType } from "@/types/User";
import axios from "axios";
import {
  Facebook,
  Instagram,
  LucideCamera,
  LucideInstagram,
  Twitter,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import BannerComponent from "../lib_components/BannerComponent";
import { getToken } from "@/utils/Cookie";
import { PROFILE_CONFIG } from "@/config/config";
import ROUTE from "@/config/routes";
import { BannerModalProps } from "@/types/Components";
import { countries } from "@/lib/Locations";
import { PiSnapchatLogoDuotone } from "react-icons/pi";

const EditProfileButton = ({ user }: { user: any }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 text-sm font-semibold text-white bg-black border border-black rounded sm:px-4 dark:bg-primary-dark-pink text-color cursor-pointer"
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
    {} as UserUpdateProfileType
  );
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    setUserData((prev) => {
      return { ...prev, email: user?.email };
    });
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) {
      setFile(e.currentTarget.files?.[0]);
      setUserData({ ...userData, profile_image: e.currentTarget.files?.[0] });
    }
  };

  const handleSaveClick = async () => {
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
        const token = getToken();
        const response = await axios.post(ROUTE.PROFILE_UPDATE, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOpen(false);
        router.refresh();
        return response;
      };

      toast.promise(updateProfile(formData), {
        loading: PROFILE_CONFIG.PROFILE_UPDATING_MSG,
        success: PROFILE_CONFIG.PROFILE_UPDATED_SUCCESS_MSG,
        error: PROFILE_CONFIG.PROFILE_UPDATED_ERROR_MSG,
      });
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
      className={`fixed inset-0 w-full h-full bg-white dark:bg-gray-950 z-[250] flex items-center justify-center transition-all duration-300 ${open
        ? "opacity-100 pointer-events-auto"
        : "pointer-events-none opacity-0"
        }`}
    >
      <div
        className="relative bg-white dark:bg-slate-950 lg:max-w-6xl w-full rounded-none md:rounded p-6 md:p-8 h-dvh lg:h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute text-gray-500 transition-colors top-4 right-4 hover:text-primary-dark-pink cursor-pointer"
          onClick={() => setOpen(false)}
          aria-label="Close"
          type="button"
        >
          <X size={28} />
        </button>
        <h1 className="mb-6 text-2xl font-bold text-center dark:text-white">
          Edit Profile
        </h1>
        <div className="flex justify-center lg:justify-start mb-5 rounded-xl">
          <BannerComponent
            profile_banner={user ? user.profile_banner : "/site/banner.png"}
          />
        </div>
        <div className="flex flex-col items-center lg:items-start mb-6">
          <label
            htmlFor="imageUpload"
            className="relative cursor-pointer group"
          >
            <div className="relative inline-block p-1 mb-2 overflow-hidden transition-all border-4 border-dotted rounded-full border-primary-dark-pink/40 dark:border-slate-700 group-hover:border-primary-dark-pink">
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
              <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-full opacity-15 bg-black/30 group-hover:opacity-100">
                <LucideCamera size={22} className="text-white" />
              </div>
            </div>
          </label>
          <input
            onChange={handleFileChange}
            type="file"
            id="imageUpload"
            className="hidden"
          />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveClick();
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
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Social Links
            </h2>
            {/* Instagram */}
            <div className="grid grid-cols-12 items-center rounded-lg border border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 overflow-hidden transition-shadow focus-within:shadow-md group">
              <div className="flex items-center justify-center h-full col-span-2 bg-primary-dark-pink/10 dark:bg-primary-dark-pink/20 py-3 transition group-focus-within:bg-primary-dark-pink/20">
                <Instagram className="text-primary-dark-pink dark:text-white w-6 h-6" />
              </div>
              <input
                type="text"
                onChange={handleInputChange}
                name="instagram"
                defaultValue={String(user?.Settings?.instagram_url || "")}
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
                defaultValue={String(user?.Settings?.twitter_url || "")}
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
                defaultValue={String(user?.Settings?.facebook_url || "")}
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
                defaultValue={String(user?.Settings?.snapchat_url || "")}
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
                defaultValue={String(user?.Settings?.tiktok_url || "")}
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
                defaultValue={String(user?.Settings?.telegram_url || "")}
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
                defaultValue={String(user?.Settings?.youtube_url || "")}
                className="col-span-10 p-3 text-black dark:text-white bg-transparent border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition"
                placeholder="https://youtube.com/@paymefans"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white transition-colors rounded-lg shadow bg-primary-dark-pink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-primary-dark-pink col-span-2 cursor-pointer"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfileButton;
