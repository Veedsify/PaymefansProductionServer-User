"use client"
import { Call, LivestreamLayout, useCallStateHooks } from "@stream-io/video-react-sdk";
import { LucideHeart, LucideSend, LucideShare2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LiveStreamSockets from "../custom-hooks/live-stream-sockets";
import VideoStreamStats from "../sub_components/video-stream-stats";

interface VideoStreamerProps {
    className?: string;
    call?: Call;
    streamId: string;
    streamUser?: any;
}

const VideoStreamer: React.FC<VideoStreamerProps> = ({ className, call, streamId, streamUser }) => {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();

    return (
        <>
            <LivestreamLayout
                muted={false}
                enableFullScreen={false}
                floatingParticipantProps={{
                    enableFullScreen: false,
                    showParticipantCount: false,
                    showLiveBadge: false,
                    showSpeakerName: true,
                }}
                showParticipantCount={false}
                showLiveBadge={false}
                showDuration={false}
            />
            <VideoStreamStats  streamId={streamId} />
        </>
    )
};




export default VideoStreamer;
