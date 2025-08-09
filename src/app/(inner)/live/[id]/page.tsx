"use client";;
import { DyteProvider, useDyteClient } from "@dytesdk/react-web-core";
import { useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import VideoStreamer from "@/components/video/VideoStreamer";

const ViewStream = () => {
  const [meeting, initMeeting] = useDyteClient();
  const params = useParams();
  const streamId = params.id;
  const router = useRouter();

  const fetchStream = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_LIVE_SERVER}/stream/${streamId}`
      );
     } catch (error) {
      console.log(error);
    }
  }, [streamId]);

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  return (
    <DyteProvider value={meeting}>
      <VideoStreamer streamId={streamId!} />
    </DyteProvider>
  );
};

export default ViewStream;
