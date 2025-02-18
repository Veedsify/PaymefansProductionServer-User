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

const EditProfileButton = ({ user }: { user: any }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="sm:px-4 py-1 px-2 text-sm font-semibold text-white dark:bg-primary-dark-pink bg-black border border-black rounded text-color"
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      className={`fixed inset-0 w-full h-full  bg-white dark:bg-slate-950 z-50 flex items-center justify-center transition-all duration-300 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "pointer-events-none opacity-0"
      }`}
    >
      <span
        className="absolute top-5 right-5 cursor-pointer"
        onClick={() => setOpen(false)}
      >
        <X />
      </span>
      <div
        className="bg-white dark:bg-slate-900 md:max-w-7xl p-5 h-full md:min-w-[550px] w-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="font-bold text-lg md:text-xl mb-5 dark:text-white">
          Edit Profile
        </h1>
        <div className="mb-3 rounded-xl overflow-hidden">
          <BannerComponent
            profile_banner={user ? user.profile_banner : "/site/banner.png"}
          />
        </div>
        <label htmlFor="imageUpload">
          <div className="relative border-[3px] mb-3 inline-block p-2 rounded-full border-dotted group">
            <Image
              src={
                file
                  ? URL.createObjectURL(file)
                  : user?.profile_image || "/site/avatar.png"
              }
              alt=""
              width={100}
              priority
              height={100}
              className="object-cover w-20 h-20 rounded-full lg:w-24 lg:h-24 aspect-square "
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200">
              <LucideCamera size={20} className="text-white" />
            </div>
          </div>
        </label>
        <input
          onChange={handleFileChange}
          type="file"
          id="imageUpload"
          className="hidden"
        />

        {/* <form onSubmit={(e) => e.preventDefault()} action=""> */}
        <div>
          <input
            type="text"
            onChange={handleInputChange}
            name="name"
            defaultValue={user?.name}
            className="w-full block border mb-3 dark:text-white dark:bg-slate-900 dark:border-slate-700 border-gray-300 p-4 outline-none text-black rounded-xl"
            placeholder="Name "
          />
        </div>
        <div>
          <input
            type="text"
            onChange={handleInputChange}
            name="location"
            className="w-full block border mb-3 dark:text-white dark:bg-slate-900 dark:border-slate-700 border-gray-300 p-4 outline-none text-black rounded-xl"
            defaultValue={user?.location ? user?.location : ""}
            placeholder="Location "
          />
        </div>
        <div>
          <input
            type="email"
            defaultValue={user?.email ? user?.email : ""}
            className="w-full block border mb-3 dark:text-white dark:bg-slate-900 dark:border-slate-700 border-gray-300 p-4 outline-none text-black rounded-xl select-none cursor-none"
            name="email"
            readOnly
            onChange={handleInputChange}
            placeholder="Email "
          />
        </div>
        <div>
          <textarea
            name="bio"
            id=""
            rows={6}
            onChange={handleInputChange}
            className="resize-none w-full block outline-none border mb-3 border-gray-300 dark:text-white dark:bg-slate-900 dark:border-slate-700 p-4 text-black rounded-xl"
            placeholder="Bio"
            defaultValue={user?.bio ? user?.bio : ""}
          ></textarea>
        </div>
        <div>
          <input
            type="text"
            onChange={handleInputChange}
            name="website"
            defaultValue={user?.website ? user?.website : ""}
            className="w-full block border mb-5 border-gray-300 p-4 outline-none text-black rounded-xl dark:text-white dark:bg-slate-900 dark:border-slate-700"
            placeholder="Website"
          />
        </div>
        <div className="grid grid-cols-12 border rounded-xl items-center justify-center mb-5 overflow-hidden dark:border-slate-600">
          <div
            className="flex items-center justify-center col-span-2 bg-gray-100 dark:bg-black dark:text-white h-full
                    "
          >
            <Instagram />
          </div>
          <input
            type="text"
            onChange={handleInputChange}
            name="instagram"
            className="w-full block border-gray-300 dark:text-white dark:bg-slate-900 dark:border-slate-700 p-4 outline-none text-black  col-span-10"
            placeholder="https://instagram.com/@paymefans"
          />
        </div>
        <div className="grid grid-cols-12 border rounded-xl items-center justify-center mb-5 overflow-hidden dark:border-slate-600">
          <div
            className="flex items-center justify-center col-span-2 bg-gray-100 dark:bg-black dark:text-white h-full
                    "
          >
            <Twitter />
          </div>
          <input
            type="text"
            onChange={handleInputChange}
            name="twitter"
            className="w-full block border-gray-300 dark:text-white dark:bg-slate-900 dark:border-slate-700 p-4 outline-none text-black  col-span-10"
            placeholder="https://twitter.com/@paymefans"
          />
        </div>
        <div className="grid grid-cols-12 border rounded-xl items-center justify-center mb-5 overflow-hidden dark:border-slate-600">
          <div
            className="flex items-center justify-center col-span-2 bg-gray-100 dark:bg-black dark:text-white h-full
                    "
          >
            <Facebook />
          </div>
          <input
            type="text"
            onChange={handleInputChange}
            name="facebook"
            className="w-full block border-gray-300 dark:text-white dark:bg-slate-900 dark:border-slate-700 p-4 outline-none text-black  col-span-10"
            placeholder="https://facebook.com/@paymefans"
          />
        </div>
        <div>
          <input
            type="submit"
            onClick={handleSaveClick}
            defaultValue={"Save"}
            className="w-full block border mb-3 dark:text-white dark:bg-slate-900 dark:border-slate-700 bg-primary-dark-pink p-4 outline-none text-white rounded-xl cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

export default EditProfileButton;
