import { StoryHeaderProps } from "@/types/Components";
import Image from "next/image";
import Link from "next/link";

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
    <div className="absolute top-1 w-full left-0 z-50">
      <div className="w-full bg-gradient-to-b from-[rgba(0,0,0,0.2)] to-[rgba(0,0,0,0.0)]">
        <div className="flex items-center justify-between px-4 py-3 md:py-5 bg-transparent">
          {/* Left side - Profile info */}
          <div className="flex items-center space-x-3">
            {/* Back button */}
            {/* <button className="p-1 hover:bg-gray-700 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            <div className="h-12 w-12 rounded-full overflow-hidden shadow">
              <Link href={`/${username}`}>
                <Image
                  height={48}
                  width={48}
                  src={profileImage}
                  alt={username}
                  className="h-full w-full object-cover"
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

          {/* Right side - Menu */}
          {/* <button className="p-1 hover:bg-gray-700 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default StoriesHeader;
