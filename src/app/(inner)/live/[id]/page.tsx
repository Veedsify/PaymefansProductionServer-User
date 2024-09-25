"use client";
import '@stream-io/video-react-sdk/dist/css/styles.css';
import VideoStreamer from "@/components/route_component/video_streamer";
import axiosInstance from "@/utils/axios";
import { LivestreamLayout, StreamCall, StreamTheme, StreamVideo, StreamVideoClient, StreamVideoEvent, User } from "@stream-io/video-react-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from 'next/navigation';
import swal from 'sweetalert';
import StreamNotLive from '@/components/route_component/stream-not-live';

const ViewStream = ({ params }: { params: { id: string } }) => {
    const streamId = params.id;
    const apiKey = process.env.NEXT_PUBLIC_GETTREAM_KEY as string;
    const router = useRouter();
    const [callId, setCallId] = useState<string>("");
    const [streamUser, setStreamUser] = useState<User | null>(null);

    const user: User = useMemo(() => {
        return {
            type: 'anonymous'
        };
    }, []);

    useEffect(() => {
        const fetchStream = async () => {
            try {
                const response = await axiosInstance.get(`/stream/${streamId}`);
                setCallId(response.data.data.stream_call_id);
                setStreamUser(response.data.data.user);
            } catch (error) {
                // console.log(error);
            }
        };
        fetchStream();
    }, [streamId]);

    const client = useMemo(() => {
        return new StreamVideoClient({ apiKey, user });
    }, [apiKey, user]);

    const call = useMemo(() => {
        return client.call('livestream', callId);
    }, [client, callId]);

    //   Subscribe to all events
    const unsubscribe = client.on('call.ended', (event: StreamVideoEvent) => {
        if (event.type === 'call.ended') {
            router.push("/profile")
        }
    });

    useEffect(() => {
        return () => {
            unsubscribe();
        };
    }, [unsubscribe]);


    useEffect(() => {
        if (call && callId) {
            call.join().catch((error) => {
                console.error('Failed to join call', error);
            });
        }
    }, [call, callId]);


    if (!streamUser && !callId) {
        return <StreamNotLive />
    }

    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <div className="relative flex flex-col h-full border-none outline-none pointer-events-all">
                    <StreamTheme as="main" className="stream-style rounded-0">
                        <LivestreamLayout
                            showDuration={false}
                            showLiveBadge={false}
                            showParticipantCount={false}
                            enableFullScreen={false}
                        />
                    </StreamTheme>
                </div>
                {/* <VideoStreamer
                            streamUser={streamUser}
                            streamId={streamId}
                            call={call}
                            className="absolute inset-0 w-full h-full object-cover" /> */}
            </StreamCall>
        </StreamVideo>
    );
}

export default ViewStream;
