"use client";
import '@stream-io/video-react-sdk/dist/css/styles.css';
import {
    StreamVideoClient,
    StreamVideo,
    User,
    StreamCall,
    StreamTheme,
    EgressResponse
} from "@stream-io/video-react-sdk";
import StreamDeckCamera from "./stream-deck-camera";
import useLivestreamStore from "@/contexts/livestream-context";
import { useUserAuthContext } from "@/lib/userUseContext";
import { streamDataProps } from '@/types/components';

const GetLivestream = () => {
    const state = useLivestreamStore.getState();
    return state.streamData;
}

console.log("Live Stream Data", GetLivestream());

const apiKey = process.env.NEXT_PUBLIC_GETTREAM_KEY as string;
const userId = GetLivestream().userId;
const callId = GetLivestream().callId;
const token = GetLivestream().token;

// Ensure user data is present
const user: User = {
    id: userId,
    name: GetLivestream().name,
};

const client = new StreamVideoClient({ apiKey, user, token });
const call = client.call("livestream", callId);
call.join({ create: true });

const StreamDeck = ({ streamData }: { streamData: streamDataProps }) => {
    const { user: thisUser } = useUserAuthContext();
    return (
        <>
            <StreamVideo client={client}>
                <StreamTheme as="main" className="stream-style rounded-0">
                    <StreamCall call={call}>
                        <StreamDeckCamera streamData={streamData} thisUser={thisUser} />
                    </StreamCall>
                </StreamTheme>
            </StreamVideo>
        </>
    );
};

export default StreamDeck;
