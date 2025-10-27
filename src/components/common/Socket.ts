// Dynamic import will be used in the connectSocket function
interface ConnectParams {
  username?: string | null;
  userid?: string | null;
}
interface SocketConfig {
  url: string;
  path: string;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  timeout: number;
  autoConnect?: boolean;
  heartbeatIntervalMs: number;
  reconnectionDelayMax?: number;
  randomizationFactor?: number;
  transports?: ("websocket" | "polling")[];
  reconnection?: boolean;
}

const defaultConfig: SocketConfig = {
  url: process.env.NEXT_PUBLIC_TS_EXPRESS_URL_DIRECT || "",
  path: "/socket.io",
  transports: ["websocket", "polling"],
  reconnection: true, // Default: true; enables automatic reconnections
  reconnectionAttempts: Infinity, // Adjust as needed for retry limits
  reconnectionDelay: 10000, // Initial delay in ms
  timeout: 5000,
  heartbeatIntervalMs: 5000,
};

// Singleton socket manager class
class SocketManager {
  private socket: any | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private currentUsername: string | null = null;
  private currentUserId: string | null = null;
  private isConnecting = false;
  private config: SocketConfig;

  constructor(config: SocketConfig) {
    this.config = config;
    this.validateConfig();
  }

  // Validate configuration to prevent runtime errors
  private validateConfig(): void {
    if (!this.config.url) {
      throw new Error("Socket URL is not defined in environment variables");
    }
  }

  // Connects the socket with the given username
  public async connect({
    username,
    userid,
  }: ConnectParams): Promise<any | null> {
    if (!username || !userid) {
      console.error("Cannot connect socket: no username provided");
      return null;
    }
    const normalizedUsername = username.trim();
    const normalizedUserid = userid.trim();

    // Early return if already connected with the same username
    if (this.socket?.connected && this.currentUsername === normalizedUsername) {
      return this.socket;
    }

    // Prevent connection without a username
    if (!normalizedUsername) {
      console.error("Cannot connect socket: no username provided");
      return null;
    }

    if (!normalizedUserid) {
      console.error("Cannot connect socket: no userid provided");
      return null;
    }

    // Prevent concurrent connection attempts
    if (this.isConnecting) {
      console.warn("Socket is already connecting...");
      return this.socket;
    }

    try {
      this.isConnecting = true;

      // Clean up existing socket
      this.disconnect();

      this.currentUsername = normalizedUsername;
      this.currentUserId = normalizedUserid;

      // Dynamically import socket.io-client
      const { io } = await import("socket.io-client");

      // Initialize new socket
      this.socket = io(this.config.url, {
        extraHeaders: {
          "X-Username": normalizedUsername,
          "X-UserId": normalizedUserid,
        },
        randomizationFactor: this.config.randomizationFactor,
        path: this.config.path,
        reconnection: true,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        timeout: this.config.timeout,
      });

      // Handle connection
      this.socket.on("connect", () => {
        this.isConnecting = false;
        console.log(`Socket connected for user: ${normalizedUsername}`);

        // Start heartbeat
        this.startHeartbeat();
      });

      // Handle disconnection
      this.socket.on("disconnect", (reason: any) => {
        this.isConnecting = false;
        this.stopHeartbeat();
        console.log(`Socket disconnected: ${reason}`);
      });

      // Handle connection errors
      this.socket.on("connect_error", (error: any) => {
        this.isConnecting = false;
        console.error(`Socket connection error: ${error.message}`);
      });

      return this.socket;
    } catch (error) {
      this.isConnecting = false;
      console.error("Failed to connect socket:", error);
      this.disconnect();
      return null;
    }
  }

  // Starts the heartbeat interval
  private startHeartbeat(): void {
    this.stopHeartbeat(); // Ensure no existing interval
    if (!this.currentUsername) return;

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected && this.currentUsername) {
        this.socket.emit("still-active", this.currentUsername);
      }
    }, this.config.heartbeatIntervalMs);
  }

  // Stops the heartbeat interval
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Returns the current socket instance
  public getSocket(): any | null {
    return this.socket?.connected ? this.socket : null;
  }

  // Checks if the socket is connected
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Gracefully disconnects the socket
  public disconnect(): void {
    this.stopHeartbeat();

    if (this.socket) {
      // Check if socket is still connected before calling methods
      if (this.socket.connected) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }
      this.socket = null;
    }

    this.currentUsername = null;
    this.isConnecting = false;
  }
}

// Export singleton instance
const socketManager = new SocketManager(defaultConfig);

export const connectSocket = (params: ConnectParams): Promise<any | null> =>
  socketManager.connect(params);
export const getSocket = (): any | null => socketManager.getSocket();
export const isSocketConnected = (): boolean => socketManager.isConnected();
export const disconnectSocket = (): void => socketManager.disconnect();
