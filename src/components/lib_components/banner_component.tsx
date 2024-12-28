"use client";
import ROUTE from "@/config/routes";
import axiosInstance from "@/utils/axios";
import { getToken } from "@/utils/cookie.get";
import { LucideCamera } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import toast from "react-hot-toast";

interface BannerComponentProps {
  profile_banner?: string;
}
const BannerComponent = ({ profile_banner }: BannerComponentProps) => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const token = getToken();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] !== undefined) {
      if (e.target.files[0].size > 1024 * 1024 * 10)
        return toast.error("Image size should be less than 10MB");
      const acceptedImageTypes = ["image/jpeg", "image/png"];
      if (!acceptedImageTypes.includes(e.target.files[0].type))
        return toast.error("Only .jpeg and .png images are allowed");
      setFile(e.target.files[0]);
      toast.promise(uploadBannerImage(e.target.files[0]), {
        loading: "Uploading banner image...",
        success: "Banner image uploaded successfully",
        error: "Failed to upload banner image",
      });
    }
  };
  const uploadBannerImage = async (file: File) => {
    const formData = new FormData();
    formData.append("banner", file);
    try {
      const response = await axiosInstance.post(
        ROUTE.BANNER_IMAGE_UPLOAD,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        router.refresh();
        return response.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative max-w-[600px]">
      <Image
        src={
          file
            ? URL.createObjectURL(file)
            : profile_banner || "/site/banner.png"
        }
        alt="Home Banner"
        width={700}
        height={400}
        priority
        className="inset-0 aspect-21-9 object-cover w-full h-full"
      />
      <form className="absolute inset-0 bg-black bg-opacity-50">
        <label
          htmlFor="banner_image_upload"
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
        >
          <span className="select-none">
            <LucideCamera stroke="#fff" size={30} />
          </span>
          <input
            onChange={handleImageChange}
            type="file"
            id="banner_image_upload"
            className="hidden"
          />
        </label>
      </form>
    </div>
  );
};

export default BannerComponent;
