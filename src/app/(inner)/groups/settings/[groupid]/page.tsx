import { LucideChevronLeft, OptionIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
  return (
    <>
      <div className="flex items-center border-b dark:border-gray-800 py-3 px-5">
        <div className="mr-4 sm:mr-6 dark:text-white">
          <Link href="/groups/1">
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
                <span>Nigerian Group Settings</span>
                {/* <span className="text-xs fw-bold text-primary-dark-pink inline-block ml-3">
                  typing...
                </span> */}
              </Link>
            </div>
            <div className="flex gap-1 items-center text-xs md:text-xs "></div>
          </div>
        </div>
      </div>
      <div className="md:py-5 md:px-8 p-3"></div>
    </>
  );
};

export default Page;
