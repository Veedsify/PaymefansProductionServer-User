"use client";
import { useCallback, useEffect, useState } from "react";
import { getToken } from "@/utils/Cookie";
import { LiveStreamSocketProps } from "@/types/Components";
import { getSocket } from "@/components/sub_components/sub/Socket";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type LiveStreamJoinProps = {
  count: number;
  liveUsers: {
    userId: string;
    socket_id: string;
  }[];
};
const LiveStreamSocket = ({ streamId }: LiveStreamSocketProps) => {
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const { user } = useUserAuthContext();
  const [commentsCount, setCommentsCount] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const socket = getSocket();
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    socket?.emit("connect-stream", { streamId, userId: user?.user_id });
  }, [streamId, user?.user_id, socket]);

  useEffect(() => {
    const handleStreamConnected = (data: LiveStreamJoinProps) => {
      setViews(data.count);
    };
    socket?.on("stream-connected", handleStreamConnected);
    window.addEventListener("beforeunload", () => {
      socket?.emit("disconnect-stream", { streamId, userId: user?.user_id });
    });

    return () => {
      window.removeEventListener("beforeunload", () => {
        socket?.emit("disconnect-stream", { streamId, userId: user?.user_id });
      });
      socket?.off("stream-connected", handleStreamConnected);
    };
  }, [streamId, user?.user_id, pathname, socket]);

  useEffect(() => {
    socket?.emit("disconnect-stream", { streamId, userId: user?.user_id });

    return () => {
      socket.disconnect();
    };
  }, [pathname, searchParams, streamId, user?.user_id, socket]);

  return { views, likes, commentsCount };
};
export default LiveStreamSocket;
