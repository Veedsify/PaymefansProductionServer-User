"use client";

import React, { SetStateAction, useEffect, useState } from "react";
import { getSocket } from "./socket";

type FollowButtonsProps = {
  status: boolean;
  followId: number | null;
  setFollowId: React.Dispatch<SetStateAction<number | null>>;
  setstatus: React.Dispatch<SetStateAction<boolean>>;
  users: { profile_id: number; user_id?: number };
};

const FollowButton = ({
  followId,
  setFollowId,
  status,
  setstatus,
  users,
}: FollowButtonsProps) => {
  const socket = getSocket();

  const followProfile = () => {
    setstatus(!status);
    socket.emit("followUser", {
      followId,
      status: !status,
      profile_id: users.profile_id,
      user_id: users.user_id,
    });
  };

  useEffect(() => {
    socket.on("followed", (data) => {
      setstatus(data.status);
      setFollowId(data.followID);
    });
    return () => {
      socket.off("followed");
    };
  }, [setstatus, setFollowId, socket]);

  return (
    <></>
  );
};

export default FollowButton;
