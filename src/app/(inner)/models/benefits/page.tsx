import getUserData from "@/utils/data/user-data";
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
          <div className="m-3 p-8 px-12 rounded-2xl">
            <Image
              src="/icons/feeling_sorry.svg"
              width={300}
              height={300}
              alt="Sorry you are already a model"
              className="w-full block"
            />
            <div>
              <h1 className="text-center mt-6 mb-8 font-bold md:text-3xl text-2xl ">
                Sorry you are already a model
              </h1>
              <div className="text-center">
                <Link
                  href={
                    user?.Model?.verification_status
                      ? `/profile`
                      : "/verification"
                  }
                  className="bg-primary-dark-pink text-white text-sm py-3 px-4 font-bold m-3 rounded-md w-full text-center"
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
    <div>
      <div className="border-black/10 dark:border-white/10 border m-3 p-8 px-12 rounded-2xl overflow-hidden relative dark:bg-gray-800">
        <div className="absolute top-0 right-0 w-40 h-40 -mr-10 -mt-10 opacity-5">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="currentColor"
              d="M100 10L122.5 57.7L174.2 66.3L137.1 103L147.5 154.5L100 130L52.5 154.5L62.9 103L25.8 66.3L77.5 57.7L100 10Z"
            />
          </svg>
        </div>

        <h2 className="text-center text-3xl font-bold mb-8 relative z-10 dark:text-white">
          Exclusive Benefits of Becoming a Model
        </h2>

        <div className="grid md:grid-cols-2 gap-6 relative z-10">
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
              className="flex items-center bg-black/10 dark:bg-white/10 backdrop-blur-sm p-4 rounded-xl transition-transform hover:scale-105"
            >
              <span className="text-2xl mr-3">{item.icon}</span>
              <p className="text-black dark:text-white font-medium">
                {item.benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex align-middle justify-center">
        <Link
          href="/models/payment"
          className="bg-primary-dark-pink text-white text-sm p-4 font-bold m-3 rounded-xl w-full text-center"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default Models;
