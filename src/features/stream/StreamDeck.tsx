"use client";
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
  return (
    <>
      <StreamDeckCamera streamData={streamData} thisUser={thisUser} />
    </>
  );
};

export default StreamDeck;
