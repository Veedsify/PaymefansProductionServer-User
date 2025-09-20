import Image from "next/image";
import Link from "next/link";
import type { StoryHeaderProps } from "@/types/Components";

const StoriesHeader = ({
  profileImage,
  username,
  timestamp,
}: StoryHeaderProps) => {
  const DateFormat = () => {
    return (
      <>
        {new Date(timestamp).toLocaleDateString() ===
        new Date().toLocaleDateString()
          ? "Today • "
          : "Yesterday • "}
        {new Date(timestamp).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </>
    );
  };
  return (
    <div className="absolute left-0 z-50 w-full top-3">
      <div className="w-full bg-gradient-to-b from-[rgba(0,0,0,0.2)] to-[rgba(0,0,0,0.0)]">
        <div className="flex items-center justify-between px-4 py-3 bg-transparent md:py-5">
          {/* Left side - Profile info */}
          <div className="flex items-center space-x-3">
            {/* Back button */}
            {/* <button className="p-1 rounded-full hover:bg-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button> */}

            {/* Profile image */}
            <div className="w-12 h-12 overflow-hidden rounded-full shadow">
              <Link href={`/${username}`}>
                <Image
                  height={48}
                  width={48}
                  src={profileImage}
                  alt={username}
                  className="object-cover w-full h-full"
                />
              </Link>
            </div>

            {/* User info */}
            <div className="flex flex-col">
              <Link
                href={username}
                className="font-medium drop-shadow-sm invert"
              >
                {username}
              </Link>
              <span className="text-xs drop-shadow-sm invert">
                <DateFormat />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoriesHeader;
