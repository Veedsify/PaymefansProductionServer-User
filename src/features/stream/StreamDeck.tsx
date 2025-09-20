"use client";
import { DyteProvider, useDyteClient } from "@dytesdk/react-web-core";
import React, { useEffect } from "react";
import useLivestreamStore from "@/contexts/LiveStreamContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { streamDataProps } from "@/types/Components";
import StreamDeckCamera from "./StreamDeckCamera";

const GetLivestream = () => {
  const state = useLivestreamStore.getState();
  return state.streamData;
};

const StreamDeck = ({ streamData }: { streamData: streamDataProps }) => {
  const { user: thisUser } = useAuthContext();
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
