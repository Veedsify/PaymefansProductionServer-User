"use client";

import { io } from "socket.io-client";

const url = process.env.NEXT_PUBLIC_EXPRESS_URL_DIRECT

export const socket = io(url as string);
export const socket2 = io(url as string, { path: "/live/socket.io" });