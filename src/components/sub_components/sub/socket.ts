"use client";

import { io } from "socket.io-client";

const url = process.env.NEXT_PUBLIC_TS_EXPRESS_URL_DIRECT
const url2 = process.env.NEXT_PUBLIC_LIVE_SERVER

export const socket = io(url as string);
export const socket2 = io(url2 as unknown as string);
