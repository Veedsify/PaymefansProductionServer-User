import { ImageVerification } from "@/components/sub_components/imageVerification";
import VerificationPageButton from "@/components/sub_components/verification-button";
import VideoVerification from "@/components/sub_components/videoverification";
import { LucideInfo } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Verification",
    description: "Verify your identity by taking a short peace sign video",
}

const Verification = () => {
    return (
        <div className="min-h-screen p-5 md:p-7 dark:text-white">
            <div className="max-w-screen-xl pt-12 mx-auto mb-24 md:mt-16">
                <h1 className="mt-auto mb-16 text-2xl font-bold text-center">Verify Yourself</h1>
                <div className="grid max-w-96 mx-auto mb-12">
                    <div>
                        <Image width={150} height={150} src="/images/verification.png" alt="" className="block text-center mx-auto mb-4 aspect-square rounded-xl" />
                    </div>
                </div>
                <h5 className="text-lg font-bold mb-4 text-center max-w-96 mx-auto">
                    Verify your identity by taking a short video
                </h5>
                <p className="text-sm text-center max-w-96 mx-auto mb-6 leading-relaxed">
                    Help us keep Paymefans safe by verifying your identity. This lets us know you&apos;re a real person and helps us keep your account secure.
                    <br />
                    <br />
                    We&apos;ll keep your information private and delete it after we&apos;ve confirmed your identity.
                </p>
                <div className="bg-coins-card-bottom max-w-96 mx-auto p-4 py-4 rounded-xl flex items-center gap-4" >
                    <span>
                        <LucideInfo className="text-primary-text-dark-pink" size={30} />
                    </span>
                    <p className="text-sm font-medium text-primary-text-dark-pink">
                        Note that these photos will appear on your profile for others to see so make them nice.
                    </p>
                </div>
               <VerificationPageButton          
                />
            </div>
        </div>
    );
}

export default Verification;