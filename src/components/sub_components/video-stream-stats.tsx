"use cleint";
import { LucideHeart, LucideSend, LucideShare2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LiveStreamSockets from "../custom-hooks/live-stream-sockets";
import { useEffect } from "react";
import { useUserAuthContext } from "@/lib/userUseContext";
import { socket2 } from "./sub/socket";

const VideoStreamStats = ({ streamId }: { streamId: string | string[] }) => {
  const { user } = useUserAuthContext();
  const { views, likes } = LiveStreamSockets({ streamId });

  useEffect(() => {
    socket2.on("stream-connected", (data) => {
      console.log(data);
    });

    const handleUserIsActive = () => {
      socket2.emit("connect-stream", {
        userId: user?.user_id,
        streamId: streamId,
      });
    };

    const handleUserIsNotActive = () => {
      socket2.emit("disconnect-stream", {});
    };

    window.addEventListener("focus", handleUserIsActive);
    window.addEventListener("beforeunload", handleUserIsNotActive);
    window.addEventListener("blur", handleUserIsNotActive);

    return () => {
      socket2.off("stream-connected");
      socket2.emit("disconnect-stream", {});
      window.removeEventListener("focus", handleUserIsActive);
      window.removeEventListener("beforeunload", handleUserIsNotActive);
      window.removeEventListener("blur", handleUserIsNotActive);
    };
  }, [user, streamId]);

  return (
    <>
      <div className="absolute bottom-0 flex-1 left-0 w-full bg-video-stream-gradient">
        <div className="p-5 flex items-end gap-8">
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-3">
              <Image
                src="/images/user.png"
                alt="coin"
                width={60}
                height={60}
                className="h-[60px] w-[60px] rounded-full object-cover border-primary-dark-pink border-2"
              />
              <div>
                <span className="text-sm font-bold block mb-2 text-white">
                  <Link href="/user/username">@jenna</Link>
                </span>
                <span className="text-sm font-medium text-white">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Explicabo ab iure necessitatibus magni natus voluptatibus
                  totam repudiandae vitae temporibus minus!
                </span>
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="flex text-center justify-center flex-col gap-8 ml-auto">
              <button className="flex items-center justify-center flex-col gap-2">
                <LucideHeart
                  fill="transparent"
                  stroke="#CC0DF8"
                  size={35}
                  strokeWidth={1}
                />
                <span className="text-white text-xs font-medium">1.2k</span>
              </button>
              <button className="flex items-center justify-center flex-col gap-2">
                <Image
                  src="/site/coin.svg"
                  alt="coin"
                  width={25}
                  height={25}
                  className="h-[25px] w-[25px]"
                />
                <span className="text-white text-xs font-medium">Point me</span>
              </button>
              <button className="flex items-center justify-center flex-col gap-2">
                <LucideShare2 stroke="#CC0DF8" />
                <span className="text-white text-xs font-medium">share</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 pb-10">
          <form
            action=""
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="text"
              className="p-3 border border-white w-full rounded-md font-medium flex-1 bg-transparent text-white outline-none"
            />
            <button
              type="submit"
              className="p-3 bg-primary-dark-pink rounded-md"
            >
              <LucideSend stroke="#fff" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default VideoStreamStats;
