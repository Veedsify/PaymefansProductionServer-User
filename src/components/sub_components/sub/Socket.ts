import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let currentUsername: string | null = null;
let isConnecting = false;

export const connectSocket = (username?: string | null | undefined) => {
  try {
    if (!socket) {
      isConnecting = true;
      currentUsername = username as string;

      socket = io(process.env.NEXT_PUBLIC_TS_EXPRESS_URL_DIRECT as string, {
        forceNew: true, // Force a new connection
        query: {
          username,
        },
      });

      socket.on("connect", () => {
        isConnecting = false;

        // Start heartbeat to keep connection alive and update activity
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(() => {
          if (socket?.connected && currentUsername) {
            socket.emit("still-active", currentUsername);
          }
        }, 30000); // Send heartbeat every 30 seconds
      });

      socket.on("disconnect", (reason) => {
        isConnecting = false;

        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
      });

      socket.on("connect_error", (error) => {
        isConnecting = false;
      });

      socket.connect();
    }
    return socket;
  } catch (error) {
    disconnectSocket();
  }
};

export const getSocket = (): Socket => {
  // If socket exists and username hasn't changed, return existing socket
  if (socket && socket.connected) {
    return socket;
  }

  // If we're already in the process of connecting, wait and return existing socket
  if (isConnecting && socket) {
    return socket;
  }

  return io(process.env.NEXT_PUBLIC_TS_EXPRESS_URL_DIRECT as string, {
    forceNew: true, // Force a new connection
    query: {
      username: currentUsername,
    },
  });
};

export const disconnectSocket = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentUsername = null;
  isConnecting = false;
};

// Helper function to check if socket is connected
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

// Helper function to get current username
export const getCurrentUsername = (): string | null => {
  return currentUsername;
};
