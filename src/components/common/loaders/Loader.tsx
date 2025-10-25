"use client";
import { cn } from "@/components/ui/cn";
import Image from "next/image";
import { useEffect, useState } from "react";

const Loader = () => {
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // simulate load
    return () => clearTimeout(timer);
  }, []);

    if (!loading) return null;

    return (
        <div
            className={cn(
                "fixed z-[999] duration-300 ease-out left-0 top-0 w-full bg-black min-h-dvh flex items-center justify-center",
                loading
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none",
            )}
        >
            <div className="flex flex-col items-center justify-center">
                <span className="animate-bounce flex flex-1">
                    <Image
                        width={720}
                        height={720}
                        priority
                        unoptimized
                        src="/site/logos/logo2.png"
                        alt="Loader"
                        className=" w-32 md:w-[150px] h-[48px]"
                    />
                </span>
            </div>
        </div>
    );
};

export default Loader;
