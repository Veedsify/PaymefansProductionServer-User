"use client";
import { UserUpdateProfileType } from "@/types/user";
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
import BannerComponent from "../lib_components/banner_component";
import { getToken } from "@/utils/cookie.get";
import { PROFILE_CONFIG } from "@/config/config";
import ROUTE from "@/config/routes";
import { BannerModalProps } from "@/types/components";
import { countries } from "@/lib/locations";

const EditProfileButton = ({ user }: { user: any }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 text-sm font-semibold text-white bg-black border border-black rounded sm:px-4 dark:bg-primary-dark-pink text-color"
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
      className={`fixed inset-0 w-full h-full bg-black/40 dark:bg-black/70 z-[250] flex items-center justify-center transition-all duration-300 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="relative bg-white dark:bg-slate-900 md:max-w-2xl w-full rounded-none md:rounded shadow-2xl p-6 md:p-8 h-dvh overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute text-gray-500 transition-colors top-4 right-4 hover:text-primary-dark-pink"
          onClick={() => setOpen(false)}
          aria-label="Close"
          type="button"
        >
          <X size={28} />
        </button>
        <h1 className="mb-6 text-2xl font-bold text-center dark:text-white">
          Edit Profile
        </h1>
        <div className="flex justify-center mb-5 rounded-xl">
          <BannerComponent
            profile_banner={user ? user.profile_banner : "/site/banner.png"}
          />
        </div>
        <div className="flex flex-col items-center mb-6">
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
          className="space-y-4"
        >
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
          <div className="grid items-center grid-cols-12 mb-2 overflow-hidden border rounded-lg border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
            <div className="flex items-center justify-center h-full col-span-2 py-2 text-primary-dark-pink dark:text-white">
              <Instagram />
            </div>
            <input
              type="text"
              onChange={handleInputChange}
              name="instagram"
              className="col-span-10 p-2 text-black bg-transparent border-none outline-none dark:text-white"
              placeholder="https://instagram.com/@paymefans"
            />
          </div>
          <div className="grid items-center grid-cols-12 mb-2 overflow-hidden border rounded-lg border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
            <div className="flex items-center justify-center h-full col-span-2 py-2 text-primary-dark-pink dark:text-white">
              <Twitter />
            </div>
            <input
              type="text"
              onChange={handleInputChange}
              name="twitter"
              className="col-span-10 p-2 text-black bg-transparent border-none outline-none dark:text-white"
              placeholder="https://twitter.com/@paymefans"
            />
          </div>
          <div className="grid items-center grid-cols-12 mb-4 overflow-hidden border rounded-lg border-black/10 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
            <div className="flex items-center justify-center h-full col-span-2 py-2 text-primary-dark-pink dark:text-white">
              <Facebook />
            </div>
            <input
              type="text"
              onChange={handleInputChange}
              name="facebook"
              className="col-span-10 p-2 text-black bg-transparent border-none outline-none dark:text-white"
              placeholder="https://facebook.com/@paymefans"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white transition-colors rounded-lg shadow bg-primary-dark-pink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-primary-dark-pink"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfileButton;
