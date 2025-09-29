import "@fontsource-variable/bricolage-grotesque";

import Image from "next/image";
import "../globals.css";
import { LucideArrowLeft } from "lucide-react";
import Link from "next/link";

const NotFound = () => {
  return (
    <div
      className={`flex items-center text-center justify-center flex-col min-h-dvh w-full`}
    >
      <div className="mx-auto">
        <Image
          className="block h-8 w-36 mb-8"
          width={150}
          height={30}
          priority
          quality={100}
          src="/site/logo2.png"
          alt=""
        />
      </div>
      <Image
        src="/site/404user.svg"
        alt="404"
        width={300}
        height={300}
        className="block mb-5 h-auto w-[200px] mx-auto md:w-96"
      />
      <h1 className="mb-5 text-2xl font-bold dark:text-white">
        <span className="text-7xl text-primary-dark-pink">404</span>
        <br />
        Sorry This Page Doesn&apos;t Exist
      </h1>

      <p className="mb-4 dark:text-white">Page was not found</p>
      <div>
        <Link
          className="inline-flex items-center justify-center px-4 text-sm py-2 font-medium text-white rounded-lg gap-4 hover:bg-primary-text-dark-pink duration-300 bg-primary-dark-pink"
          href={"/"}
        >
          <LucideArrowLeft />
          Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
