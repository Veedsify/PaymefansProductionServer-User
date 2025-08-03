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
                <div className="relative flex items-center justify-center mb-3 overflow-hidden bg-gray-200 cursor-pointer aspect-square rounded-xl " ref={ref} style={{
                    backgroundSize: "cover",
                }}>
                    <Image
                        width={40}
                        height={40}
                        priority
                        src="/site/verification_images.png" alt="" className="block mx-auto mb-4 text-center" />
                </div>
                <p className="text-sm font-medium text-center">Upload 3 different photos of you</p>
            </label>
            <input onChange={imageUploaded} type="file" multiple={true} accept="image/*" className="hidden" name="images" id="images" />
        </div>
    );
}
