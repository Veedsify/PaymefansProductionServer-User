"use client";
import GroupMessageBubbles from "@/components/sub_components/group-message-bubbles";
import {
  LucideArrowLeft,
  LucideCamera,
  LucideChevronLeft,
  LucideGrip,
  LucideOption,
  LucidePlus,
  LucideSendHorizonal,
  OptionIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RefObject, useRef } from "react";

const Page = () => {
  const ref = useRef(null);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b dark:border-gray-800 py-3 px-5">
        <div className="mr-4 sm:mr-6 dark:text-white">
          <Link href="/groups">
            <LucideChevronLeft size={30} className="cursor-pointer" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <Image
              className="rounded-full aspect-square object-cover"
              width={50}
              height={50}
              priority
              src={
                "https://images.pexels.com/photos/30612850/pexels-photo-30612850/free-photo-of-outdoor-portrait-of-a-man-relaxing-on-swing-in-abuja.jpeg?auto=compress&cs=tinysrgb&w=600"
              }
              alt=""
            />
          </div>
          <div className="dark:text-white">
            <div className="font-bold text-sm md:text-base">
              <Link
                href={`/@dike`}
                className="flex gap-1 duration-300 items-center"
              >
                <span>Nigerian Group</span>
                {/* <span className="text-xs fw-bold text-primary-dark-pink inline-block ml-3">
                  typing...
                </span> */}
              </Link>
            </div>
            <div className="flex gap-1 items-center text-xs md:text-xs "></div>
          </div>
        </div>
        <div className="ml-auto dark:text-white">
          <Link href="/groups/settings/1">
            <OptionIcon size={20} className="cursor-pointer" />
          </Link>
        </div>
      </div>
      <div className="relative flex-1 flex flex-col">
        <div className="flex-1 w-full h-full max-h-[calc(100vh-300px)] lg:max-h-[calc(100vh-187px)] overflow-y-auto p-4 md:p-6">
          <GroupMessageBubbles />
        </div>
        <div className="w-full">
          <div className="flex w-full items-center gap-5 px-6 dark:bg-gray-800 bg-gray-100 lg:py-2 py-4">
            <div
              ref={ref as unknown as RefObject<HTMLDivElement>}
              contentEditable={true}
              id="message-input"
              className="bg-transparent outline-none w-full p-2 font-semibold resize-none dark:text-white"
            ></div>
            <span className="cursor-pointer">
              <LucidePlus stroke="#CC0DF8" size={25} />
            </span>
            <span className="cursor-pointer">
              <LucideCamera stroke="#CC0DF8" size={25} />
            </span>
            <span className="cursor-pointer">
              <LucideSendHorizonal stroke="#CC0DF8" size={25} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
