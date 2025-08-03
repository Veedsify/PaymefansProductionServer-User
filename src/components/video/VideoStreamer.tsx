"use client";
import LiveStreamSocket from "../custom-hooks/LiveStreamSocket";
// import VideoStreamStats from "../sub_components/video-stream-stats";

interface VideoStreamerProps {
  streamId: string | string[];
}

const VideoStreamer: React.FC<VideoStreamerProps> = ({ streamId }) => {
  return (
    <div className="relative h-dvh">
      <div className="absolute inset-0 w-full h-full livestream-view"></div>
      {/* <VideoStreamStats streamId={streamId} /> */}
    </div>
  );
};

export default VideoStreamer;
