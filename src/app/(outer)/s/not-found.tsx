import "@fontsource-variable/geist";
import Image from "next/image";
import "../../globals.css";
import { LucideArrowLeft } from "lucide-react";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className={`flex items-center justify-center flex-col h-dvh w-full`}>
      <div className="flex flex-col text-center gap-1">
        <div className="mx-auto mt-8 mb-16">
          <Image
            className="block h-8 w-36"
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
          className="block mb-5 h-auto w-[300px] md:mx-auto md:w-96"
        />
        <h1 className="mb-5 text-3xl font-bold dark:text-white">
          <span className="text-9xl text-primary-dark-pink">404</span>
          <br />
          Sorry This Page Doesn&apos;t Exist
        </h1>

        <p className="mb-4 dark:text-white">Page was not found</p>
        <div>
          <Link
            className="inline-flex px-6 py-2 font-medium text-white rounded-lg gap-4 hover:bg-primary-text-dark-pink duration-300 bg-primary-dark-pink"
            href={"/"}
          >
            <LucideArrowLeft />
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
