import { LucideLock } from "lucide-react";
import Image from "next/image";

export const LockedMediaOverlay = ({
  type,
  mediaIsVideo,
  duration,
  onClick,
  price,
}: {
  type: "price" | "subscribers";
  mediaIsVideo: boolean;
  duration: string;
  onClick?: (e: React.MouseEvent) => void;
  price?: number | null;
}) => {
  return (
    <div
      className="lock-icon absolute inset-0 w-[85%] h-[65%] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-lg flex items-center justify-center dark:bg-black/70  bg-black/40 cursor-pointer"
      onClick={onClick}
    >
      <span className="flex flex-col items-center justify-center text-white gap-2">
        {type === "price" ? (
          <Image
            width={25}
            height={25}
            src="/site/coin.svg"
            alt=""
            className="w-5 h-5"
          />
        ) : (
          <LucideLock stroke="white" size={25} strokeWidth={2} />
        )}
        <p className="text-sm text-center leading-4">
          {type === "price"
            ? `Unlock for ${price || 0} points`
            : "Unlock Media"}
        </p>
        {mediaIsVideo && (
          <span className="text-[10px] absolute bottom-1 right-2">
            {duration}
          </span>
        )}
      </span>
    </div>
  );
};
