"use client"
import Image from "next/image";
import { useRef } from "react";
import toast from "react-hot-toast";

export const ImageVerification = () => {
    const ref = useRef<HTMLDivElement>(null);
    const imageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target?.files) {
            if (e.target.files.length < 3) {
                toast.error("You must upload at least 3 images");
                return;
            }
            if (e.target.files.length > 3) {
                toast.error("You can only upload 3 images");
                return;
            }
            const files = e.target.files;
            if (files) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.size > 3000000) {
                        toast.error("Image size must be less than 3MB");
                        return;
                    }
                }
                if (e.target?.files[0]) {
                    if (ref.current) {
                        ref.current.style.backgroundImage = `url(${URL.createObjectURL(e.target.files[0])})`;
                    }
                }
            }
        }
    }
    return (
        <div>
            <label htmlFor="images">
                <div className="flex relative bg-gray-200 items-center justify-center aspect-square rounded-xl mb-3 cursor-pointer overflow-hidden " ref={ref} style={{
                    backgroundSize: "cover",
                }}>
                    <Image
                        width={40}
                        height={40}
                        priority
                        src="/site/verification_images.png" alt="" className="block text-center mx-auto mb-4" />
                </div>
                <p className="text-center text-sm font-medium">Upload 3 different photos of you</p>
            </label>
            <input onChange={imageUploaded} type="file" multiple={true} accept="image/*" className="hidden" name="images" id="images" />
        </div>
    );
}
