import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let currentUsername: string | null = null;
let isConnecting = false;

/**
 * Connects the socket with the given username.
 * If already connected with the same user, does nothing.
 * If connected with a different user, disconnects and reconnects.
 */
export const connectSocket = (username?: string | null): Socket | null => {
  // Normalize username
  const normalizedUsername = username || null;

  // If already connected with the same username, do nothing
  if (socket?.connected && currentUsername === normalizedUsername) {
    return socket;
  }

  // If trying to connect without a username
  if (!normalizedUsername) {
    console.error("Cannot connect socket: no username provided");
    return null;
  }

  // Avoid multiple simultaneous connection attempts
  if (isConnecting) {
    console.warn("Socket is already connecting...");
    return socket;
  }

  try {
    isConnecting = true;

    // If there's an existing socket, disconnect it first
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    // Update current username
    currentUsername = normalizedUsername;

    // Create new socket connection
    socket = io(process.env.NEXT_PUBLIC_TS_EXPRESS_URL_DIRECT as string, {
      query: { username: normalizedUsername },
      path: "/socket.io",
      // Avoid unnecessary forceNew; we're manually managing singleton
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Connection established
    socket?.on("connect", () => {
      isConnecting = false;

      // Start heartbeat
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => {
        if (socket?.connected && currentUsername) {
          socket?.emit("still-active", currentUsername);
        }
      }, 5000);
    });

    // Handle disconnect
    socket?.on("disconnect", (reason) => {
      isConnecting = false;
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      console.log("Socket disconnected:", reason);
    });

    // Handle connection errors
    socket?.on("connect_error", (error) => {
      isConnecting = false;
      console.error("Socket connection error:", error);
      // Socket.io will retry automatically based on config above
    });

    return socket;
  } catch (error) {
    isConnecting = false;
    console.error("Failed to connect socket:", error);
    disconnectSocket();
    return null;
  }
};

/**
 * Returns the current socket instance.
 * If no active connection, returns null.
 * Use this only to access the socket after ensuring connection via connectSocket.
 */
export const getSocket = (): Socket | null => {
  if (socket && socket.connected) {
    return socket;
  }
  return null; // Don't create new socket — force use of connectSocket
};

/**
 * Gracefully disconnects the socket.
 */
const disconnectSocket = () => {
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

/**
 * Checks if the socket is currently connected.
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};
