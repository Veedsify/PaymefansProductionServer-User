"use client";
import React from "react";
import { DyteProvider, useDyteClient } from "@dytesdk/react-web-core";
import StreamDeckCamera from "./StreamDeckCamera";
import useLivestreamStore from "@/contexts/LiveStreamContext";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { streamDataProps } from "@/types/Components";
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
  }, [initMeeting, streamData.authToken]);
  return (
    <>
      <DyteProvider value={meeting}>
        <StreamDeckCamera streamData={streamData} thisUser={thisUser} />
      </DyteProvider>
    </>
  );
};

export default StreamDeck;
