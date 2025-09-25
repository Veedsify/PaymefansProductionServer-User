"use client";
import { cn } from "@/components/ui/cn";
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
      className={cn(
        "fixed z-[999] duration-300 ease-out bg-black min-h-dvh w-full flex items-center justify-center",
        loading
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="animate-bounce">
          <Image
            width={720}
            height={720}
            priority
            unoptimized
            src="/site/logos/logo.png"
            alt="Loader"
            className=" w-32 md:w-[200px] h-auto"
          />
        </span>
      </div>
    </div>
  );
};

export default Loader;
