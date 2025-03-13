"use client";
import LiveStreamSockets from "../custom-hooks/live-stream-sockets";
import VideoStreamStats from "../sub_components/video-stream-stats";

interface VideoStreamerProps {
  streamId: string | string[];
}

const VideoStreamer: React.FC<VideoStreamerProps> = ({ streamId }) => {
  return (
    <div className="relative h-screen">
      <div className="absolute inset-0 h-full w-full livestream-view">
      </div>
      <VideoStreamStats streamId={streamId} />
    </div>
  );
};

export default VideoStreamer;
