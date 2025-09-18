import getUserData from "@/utils/data/UserData";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProfilePage from "../../[id]/page";

export const metadata: Metadata = {
  title: "Become a model",
  description: "Profile page",
};

async function Models() {
  const user = await getUserData();
  if (user?.is_model) {
    return (
      <>
        <div>
          <div className="p-8 px-12 m-3 rounded-2xl">
            <Image
              src="/icons/feeling_sorry.svg"
              width={300}
              height={300}
              alt="Sorry you are already a model"
              className="block w-full"
            />
            <div>
              <h1 className="mt-6 mb-8 text-2xl font-bold text-center md:text-3xl ">
                Sorry you are already a model
              </h1>
              <div className="text-center">
                <Link
                  href={
                    user?.Model?.verification_status
                      ? `/profile`
                      : "/verification"
                  }
                  className="w-full px-4 py-3 m-3 text-sm font-bold text-center text-white bg-primary-dark-pink rounded-md"
                >
                  {user?.is_model && user.Model?.verification_status
                    ? "Go to your profile"
                    : "Verify your account"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="pb-28">
      <div className="relative p-8 px-12 m-3 border border-black/10 dark:border-white/10 rounded-2xl dark:bg-gray-800">
        <h2 className="relative z-10 mb-8 text-3xl font-bold text-center dark:text-white">
          Exclusive Benefits of Becoming a Model
        </h2>

        <div className="relative z-10 grid md:grid-cols-2 gap-6">
          {[
            {
              icon: "💬",
              benefit: "Chat with fans and build connections",
            },
            {
              icon: "💲",
              benefit: "Earn per message sent",
            },
            {
              icon: "🖼️",
              benefit: "Upload High Quality Image & Videos",
            },
            {
              icon: "💸",
              benefit: "Unlock subscription-based earnings",
            },
            {
              icon: "👥",
              benefit: "Engage with active subscribers",
            },
            {
              icon: "🌟",
              benefit: "Join the exclusive Creators Group",
            },
            {
              icon: "💰",
              benefit: "100% Earnings on your content",
            },
            {
              icon: "🚀",
              benefit: "Monetize your unique content",
            },
            {
              icon: "👩‍🎤",
              benefit: "Top Creator Recognition",
            },
            {
              icon: "🎥",
              benefit: "Unlimited Uploads",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center p-4 bg-black/10 dark:bg-white/10 rounded-xl"
            >
              <span className="mr-3 text-2xl">{item.icon}</span>
              <p className="font-medium text-black dark:text-white">
                {item.benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center align-middle">
        <Link
          href="/models/payment"
          className="w-full p-4 m-3 text-sm font-bold text-center text-white bg-primary-dark-pink rounded-xl"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default Models;
