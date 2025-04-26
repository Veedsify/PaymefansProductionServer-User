"use client";
import ROUTE from "@/config/routes";
import { getToken } from "@/utils/cookie.get";
import axios from "axios";
import { LucideUpload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import ReactCrop, { centerCrop, makeAspectCrop, Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface BannerComponentProps {
  profile_banner?: string;
}

const BannerComponent = ({ profile_banner }: BannerComponentProps) => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imageRef = useRef<HTMLImageElement>(null);
  const token = getToken();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file size and type
      if (selectedFile.size > 1024 * 1024 * 10)
        return toast.error("Image size should be less than 10MB");

      const acceptedImageTypes = ["image/jpeg", "image/png"];
      if (!acceptedImageTypes.includes(selectedFile.type))
        return toast.error("Only .jpeg and .png images are allowed");

      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setImageUrl(url);
    }
  };

  const onImageLoaded = useCallback((img: HTMLImageElement) => {
    const { naturalWidth, naturalHeight } = img;

    // Set initial crop to full image width/height
    const initialCrop = centerCrop(
      makeAspectCrop(
      {
        unit: "%",
        width: 100,
        height: 100,
      },
      1980 / 650, // 1980x650 aspect ratio
      naturalWidth,
      naturalHeight
      ),
      naturalWidth,
      naturalHeight
    );

    setCrop(initialCrop);
  }, []);

  const getCroppedImg = (image: HTMLImageElement, crop: Crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const uploadBannerImage = async () => {
    if (!file || !imageRef.current || !completedCrop) return;

    try {
      toast.loading("Uploading banner image...");
      const croppedImageBlob = await getCroppedImg(
        imageRef.current,
        completedCrop
      );
      if (!croppedImageBlob) {
        toast.error("Failed to crop image");
        return;
      }
      const formData = new FormData();
      formData.append(
        "banner",
        new File([croppedImageBlob], file.name, { type: file.type })
      );
      const response = await fetch(ROUTE.BANNER_IMAGE_UPLOAD, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        toast.dismiss();
        toast.error("Failed to upload banner image");
        return;
      }
      const data = await response.json();
      if (data.status) {
        toast.dismiss();
        toast.success("Banner image uploaded successfully");
        router.refresh();
        // Reset state
        setFile(null);
        setImageUrl(null);
        setCrop(undefined);
        setCompletedCrop(undefined);
      }
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Failed to upload banner image");
    }
  };

  const cancelCrop = useCallback(() => {
    setFile(null);
    setImageUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, []);

  const selectImage = () => {
    const input = document.getElementById("banner_image_upload");
    if (input) {
      input.click();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg border border-gray-200">
      {imageUrl ? (
        <div className="relative w-full flex justify-center max-h-[400px] bg-gray-50">
          <ReactCrop
            crop={crop}
            className="mx-auto w-auto max-h-[400px]"
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
          >
            <Image
              ref={imageRef}
              src={imageUrl}
              width={1200}
              height={400}
              alt="Banner Crop"
              style={{
                objectFit: "contain",
                width: "100%",
                height: "100%",
                borderRadius: "0.5rem",
              }}
              onLoad={(e) => onImageLoaded(e.currentTarget)}
              className="rounded-lg border border-gray-300"
            />
          </ReactCrop>
          <div className="absolute flex gap-2 bottom-4 right-4 z-10">
            <input
              type="file"
              id="banner_image_upload"
              onChange={handleImageChange}
              accept=".jpg,.jpeg,.png"
              className="hidden"
            />
            <button
              onClick={selectImage}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-100 transition"
            >
              Replace
            </button>
            <button
              onClick={cancelCrop}
              className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={uploadBannerImage}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow hover:bg-green-700 transition"
            >
              <LucideUpload size={18} className="mr-2" /> Upload
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[180px] bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={profile_banner || "/site/banner.png"}
            alt="Home Banner"
            width={1200}
            height={400}
            priority
            className="object-cover w-full h-full rounded-lg"
          />
          <input
            type="file"
            id="banner_image_upload"
            onChange={handleImageChange}
            accept=".jpg,.jpeg,.png"
            className="hidden"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition cursor-pointer">
            <button
              onClick={selectImage}
              className="flex items-center px-5 py-2 bg-white/90 text-gray-800 font-semibold rounded-lg shadow hover:bg-white"
            >
              <LucideUpload size={20} className="mr-2" /> Upload Banner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerComponent;
