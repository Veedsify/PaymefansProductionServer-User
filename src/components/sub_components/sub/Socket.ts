import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (username?: null | string): Socket => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_TS_EXPRESS_URL_DIRECT as string, {
            autoConnect: false,
            query: {
                username,
            }
        });
        socket.connect();
    }
    return socket;
};
