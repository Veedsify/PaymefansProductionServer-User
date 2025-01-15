"use client";
import React from "react";
// import { DyteProvider, useDyteClient } from "@dytesdk/react-web-core";
import StreamDeckCamera from "./stream-deck-camera";
import useLivestreamStore from "@/contexts/livestream-context";
import { useUserAuthContext } from "@/lib/userUseContext";
import { streamDataProps } from "@/types/components";
import { useEffect } from "react";

const GetLivestream = () => {
  const state = useLivestreamStore.getState();
  return state.streamData;
};

const StreamDeck = ({ streamData }: { streamData: streamDataProps }) => {
  const { user: thisUser } = useUserAuthContext();
  const [meeting, initMeeting] = useDyteClient();

  useEffect(() => {
    initMeeting({
      authToken: streamData.authToken,
      defaults: {
        audio: false,
        video: false,
      },
    });
  }, []);
  return (
    <>
      <DyteProvider value={meeting}>
        <StreamDeckCamera streamData={streamData} thisUser={thisUser} />
      </DyteProvider>
    </>
  );
};

export default StreamDeck;
