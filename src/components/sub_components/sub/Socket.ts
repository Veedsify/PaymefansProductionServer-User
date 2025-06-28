import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

export const getSocket = (username?: string | null | undefined): Socket => {
  // Handle undefined/null username cases
  if (!username) {
    username = "anonymous";
  }

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_TS_EXPRESS_URL_DIRECT as string, {
      autoConnect: false,
      query: {
        username,
      },
    });

    socket.on("connect", () => {
      // Start heartbeat to keep connection alive and update activity
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => {
        if (socket?.connected && username) {
          socket.emit("still-active", username);
        }
      }, 30000); // Send heartbeat every 30 seconds
    });

    socket.on("disconnect", () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    });

    socket.on("connect_error", (error) => {
      console.error("🚫 Socket connection error:", error);
    });

    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
