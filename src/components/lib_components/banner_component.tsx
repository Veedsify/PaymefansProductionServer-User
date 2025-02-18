"use client";
import ROUTE from "@/config/routes";
import axiosInstance from "@/utils/axios";
import { getToken } from "@/utils/cookie.get";
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
        3 / 1, // 1200/400 aspect ratio
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
    <div className="relative overflow-hidden">
      {imageUrl ? (
        <div className="relative w-full flex justify-center max-h-[400px]">
          <ReactCrop
            crop={crop}
            className="mx-auto w-auto max-h-[400px]"
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
          >
            <Image
              ref={imageRef}
              src={imageUrl}
              width={1000}
              height={1000}
              alt="Banner Crop"
              style={{
                objectFit: "contain",
                width: "100%",
                height: "100%",
              }}
              onLoad={(e) => onImageLoaded(e.currentTarget)}
            />
          </ReactCrop>
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <input
              type="file"
              id="banner_image_upload"
              onChange={handleImageChange}
              accept=".jpg,.jpeg,.png"
              className="hidden"
            />
            <button
              onClick={selectImage}
              className="bg-gray-200 text-black p-2 rounded cursor-pointer"
            >
              Replace
            </button>
            <button
              onClick={cancelCrop}
              className="bg-red-500 text-white p-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={uploadBannerImage}
              className="bg-green-500 text-white p-2 rounded flex items-center"
            >
              <LucideUpload size={20} className="mr-2" /> Upload
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <Image
            src={profile_banner || "/site/banner.png"}
            alt="Home Banner"
            width={1200}
            height={400}
            priority
            className="object-cover w-full h-full"
          />
          <input
            type="file"
            id="banner_image_upload"
            onChange={handleImageChange}
            accept=".jpg,.jpeg,.png"
            className="hidden"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer">
            <button
              onClick={selectImage}
              className="flex items-center bg-white px-4 py-2 rounded"
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
