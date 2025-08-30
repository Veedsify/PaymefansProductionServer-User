
import VerificationPageButton from "@/features/verification/VerificationButton";
import getUserData from "@/utils/data/UserData";
import { LucideInfo } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Verification",
  description: "Verify your identity by taking a short peace sign video",
};

const Verification = async () => {
  const user = await getUserData();

  if (user?.Model?.verification_status || !user?.is_model) {
    redirect("/profile");
  }

  return (
    <div className="p-5 min-h-dvh md:p-7 dark:text-white">
      <div className="pt-12 mx-auto mb-24 max-w-screen-xl md:mt-16">
        <h1 className="mt-auto mb-16 text-2xl font-bold text-center">
          Verify Yourself
        </h1>
        <div className="mx-auto mb-12 grid max-w-96">
          <div>
            <Image
              width={150}
              height={150}
              src="/images/verification.png"
              alt=""
              className="block mx-auto mb-4 text-center aspect-square rounded-xl"
            />
          </div>
        </div>
        <h5 className="mx-auto mb-4 text-lg font-bold text-center max-w-96">
          Verify your identity by taking a short video
        </h5>
        <p className="mx-auto mb-6 text-sm leading-relaxed text-center max-w-96">
          Help us keep Paymefans safe by verifying your identity. This lets us
          know you&apos;re a real person and helps us keep your account secure.
          <br />
          <br />
          We&apos;ll keep your information private and delete it after
          we&apos;ve confirmed your identity.
        </p>
        <div className="flex items-center p-4 py-4 mx-auto bg-coins-card-bottom max-w-96 rounded-xl gap-4">
          <span>
            <LucideInfo className="text-primary-text-dark-pink" size={30} />
          </span>
          <p className="text-sm font-medium text-primary-text-dark-pink">
            Note that these photos will not appear on your profile and are only
            for verification purposes.
          </p>
        </div>
        <VerificationPageButton />
      </div>
    </div>
  );
};

export default Verification;
