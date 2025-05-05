import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_TS_EXPRESS_URL_DIRECT as string, {
            autoConnect: false,
        });
        socket.connect();
    }
    return socket;
};
