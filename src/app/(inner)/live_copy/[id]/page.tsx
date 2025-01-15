"use client";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import VideoStreamer from "@/components/route_component/video_streamer";
import axiosInstance from "@/utils/axios";
import {
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  StreamVideoEvent,
  User,
} from "@stream-io/video-react-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import swal from "sweetalert";
import StreamNotLive from "@/components/route_component/stream-not-live";
const apiKey = process.env.NEXT_PUBLIC_GETTREAM_KEY as string;

const user: User = {
  type: "anonymous",
};

const client = new StreamVideoClient({ apiKey, user });

const ViewStream = () => {
  const params = useParams();
  const streamId = params.id;
  const router = useRouter();
  const [callId, setCallId] = useState<string>("");
  const [streamUser, setStreamUser] = useState<User | null>(null);

  const fetchStream = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/stream/${streamId}`);
      setCallId(response.data.data.stream_call_id);
      setStreamUser(response.data.data.user);
    } catch (error) {
      // console.log(error);
    }
  },[streamId]);


  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  const call = useMemo(() => {
    return client.call("livestream", callId);
  }, [client, callId]);

  //   Subscribe to all events
  const unsubscribe = client.on("call.ended", (event: StreamVideoEvent) => {
    if (event.type === "call.ended") {
      router.push("/profile");
    }
  });

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  useEffect(() => {
    if (call && callId) {
      call.join();
    }
  }, [call, callId]);

  if (!streamUser && !callId) {
    return <StreamNotLive />;
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <VideoStreamer callId={callId} streamId={streamId!} />
      </StreamCall>
    </StreamVideo>
  );
};

export default ViewStream;
