import { LucideLock } from "lucide-react";

export const LockedMediaOverlay = ({
  mediaIsVideo,
  duration,
}: {
  mediaIsVideo: boolean;
  duration: string;
}) => {
  return (
    <div className="lock-icon absolute inset-0 w-[85%] h-[65%] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-lg flex items-center justify-center dark:bg-slate-900 dark:bg-opacity-70 bg-slate-900 bg-opacity-40 cursor-not-allowed">
      <span className="flex items-center justify-center flex-col gap-2 text-white">
        <LucideLock stroke="white" size={25} strokeWidth={2} />
        <p className="text-sm text-center leading-4">
          Unlock Media
        </p>
        {mediaIsVideo && <span className="text-[10px] absolute bottom-1 right-2">{duration}</span>}
      </span>
    </div>
  );
};
