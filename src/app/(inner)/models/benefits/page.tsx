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
      <div className="border-black/10 border m-3 p-8 px-12 rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 -mr-10 -mt-10 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="white"
              d="M42.7,-62.2C53.8,-52.7,60.4,-37.6,65.6,-22.1C70.8,-6.6,74.5,9.3,70.8,23.4C67.1,37.5,56,49.8,42.5,59.1C29.1,68.5,13.2,74.8,-2.4,77.9C-18.1,81,-36.2,80.9,-48.5,71.9C-60.8,62.9,-67.2,45.1,-70.3,28.1C-73.5,11.1,-73.4,-5.1,-68,-18.3C-62.7,-31.6,-52.1,-42,-40.1,-51.1C-28.2,-60.1,-14.1,-67.8,1,-69.1C16.1,-70.5,32.3,-71.5,42.7,-62.2Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <h2 className="text-center text-3xl font-bold mb-8 relative z-10">
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
              icon: "🚀",
              benefit: "Monetize your unique content",
            },
            {
              icon: "🚀",
              benefit: "Monetize your unique content",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center bg-black/10 backdrop-blur-sm p-4 rounded-xl transition-transform hover:scale-105"
            >
              <span className="text-2xl mr-3">{item.icon}</span>
              <p className="text-black font-medium">{item.benefit}</p>
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
