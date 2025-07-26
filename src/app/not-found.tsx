import { Bricolage_Grotesque } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

const font = Bricolage_Grotesque({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const NotFound = () => {
  return (
    <div
      className={`flex ${font.className} items-center justify-center flex-col h-dvh w-full`}
    >
      <div className="flex flex-col gap-1 text-center">
        <div className="mt-8 mb-16 mx-auto">
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
        <h1 className="text-3xl font-bold mb-5 dark:text-white">
          <span className="text-9xl text-primary-dark-pink">404</span>
          <br />
          Sorry This Page Doesn&apos;t Exist
        </h1>

        <p className="dark:text-white mb-4">Page was not found</p>
        <div>
          <Link
            className="px-6 py-2 text-white inline-flex gap-4 font-medium hover:bg-primary-text-dark-pink duration-300 rounded-lg bg-primary-dark-pink"
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
