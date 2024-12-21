"use client";
import { LivestreamLayout, LivestreamPlayer } from "@stream-io/video-react-sdk";
import LiveStreamSockets from "../custom-hooks/live-stream-sockets";
import VideoStreamStats from "../sub_components/video-stream-stats";

interface VideoStreamerProps {
  callId: string;
  streamId: string | string[];
}

const VideoStreamer: React.FC<VideoStreamerProps> = ({ callId, streamId }) => {
  return (
    <div className="relative h-screen">
      <div className="absolute inset-0 h-full w-full livestream-view">
        <LivestreamLayout
          muted={false}
          showParticipantCount={false}
          showDuration={false}
          showLiveBadge={false}
          showSpeakerName={false}
          floatingParticipantProps={{
            muted: false,
            showParticipantCount: false,
            showDuration: false,
            showLiveBadge: false,
            showSpeakerName: false,
            position: "top-right",
          }}
        />
      </div>
      <VideoStreamStats streamId={streamId} />
    </div>
  );
};

export default VideoStreamer;
