"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const Loader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [setLoading]);

  if (!loading) return null;

  return (
    <div
      className={`${
        loading
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } fixed z-[999] duration-300 ease-out bg-black min-h-dvh w-full flex items-center justify-center`}
    >
      <div className="flex flex-col items-center justify-center">
        <Image
          width={200}
          height={200}
          priority
          quality={100}
          src="/site/logos/logo.png"
          alt="Loader"
          className="animate-bounce border border-white w-32 md:w-[200px] h-auto"
        />
      </div>
    </div>
  );
};

export default Loader;
