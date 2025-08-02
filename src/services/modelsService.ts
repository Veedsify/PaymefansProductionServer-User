import { getSocket } from "../components/sub_components/sub/Socket";
import { HookupProps } from "../components/models/SideModels";
import { shuffle, uniqBy } from "lodash";

export interface ModelsAndHookupsResponse {
  models: any[];
  hookups: HookupProps[];
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface UpdateCallback {
  (data: ModelsAndHookupsResponse): void;
}

class ModelsService {
  private socket = getSocket();
  private updateCallbacks: Set<UpdateCallback> = new Set();
  private realTimeListenersSetup = false;

  // Check if browser is Firefox for debugging
  private isFirefox(): boolean {
    return navigator.userAgent.toLowerCase().includes("firefox");
  }

  // Log debugging info for Firefox
  private debugLog(message: string, data?: any): void {
    if (this.isFirefox()) {
      console.log(`[Firefox Debug] ${message}`, data || "");
    }
  }

  // Subscribe to real-time updates
  subscribeToUpdates(callback: UpdateCallback): () => void {
    this.updateCallbacks.add(callback);
    this.setupRealTimeListeners();

    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(callback);
      if (this.updateCallbacks.size === 0) {
        this.cleanupRealTimeListeners();
      }
    };
  }

  // Setup real-time socket listeners
  private setupRealTimeListeners(): void {
    if (this.realTimeListenersSetup || !this.socket) return;

    this.debugLog("Setting up real-time listeners");

    const handleModelsUpdate = (newData: any) => {
      this.debugLog("Real-time models update", newData);
      if (newData?.models && Array.isArray(newData.models)) {
        this.notifyCallbacks({
          models: shuffle(newData.models),
          hookups: [],
        });
      }
    };

    const handleHookupUpdate = (newData: any) => {
      this.debugLog("Real-time hookup update", newData);
      if (newData?.hookups && Array.isArray(newData.hookups)) {
        const processedHookups = shuffle(uniqBy(newData.hookups, "username"));
        this.notifyCallbacks({
          models: [],
          hookups: processedHookups,
        });
      }
    };

    this.socket.on("models-update", handleModelsUpdate);
    this.socket.on("hookup-update", handleHookupUpdate);
    this.realTimeListenersSetup = true;
  }

  // Cleanup real-time socket listeners
  private cleanupRealTimeListeners(): void {
    if (!this.realTimeListenersSetup || !this.socket) return;

    this.debugLog("Cleaning up real-time listeners");
    this.socket.off("models-update");
    this.socket.off("hookup-update");
    this.realTimeListenersSetup = false;
  }

  // Notify all subscribed callbacks
  private notifyCallbacks(partialData: {
    models: any[];
    hookups: any[];
  }): void {
    this.updateCallbacks.forEach((callback) => {
      callback({
        models: partialData.models || [],
        hookups: partialData.hookups || [],
      });
    });
  }

  // Get user location data from localStorage
  private getUserLocationData(): LocationData | null {
    try {
      const storedLocation = localStorage.getItem("userLocation");
      if (storedLocation) {
        const locationData = JSON.parse(storedLocation);
        const isRecent = Date.now() - locationData.timestamp < 30 * 60 * 1000;

        if (isRecent && locationData.consentGiven) {
          return {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          };
        }
      }
    } catch (error) {
      console.error("Error getting location data:", error);
    }
    return null;
  }

  // Fetch models and hookups via socket
  async fetchModelsAndHookups(): Promise<ModelsAndHookupsResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        this.debugLog("Socket not available");
        resolve({
          models: [],
          hookups: [],
        });
        return;
      }

      this.debugLog("Starting fetchModelsAndHookups", {
        socketConnected: this.socket.connected,
        socketId: this.socket.id,
      });

      const timeout = setTimeout(() => {
        this.debugLog("Request timeout - returning empty data");
        cleanup();
        // Instead of rejecting, resolve with empty data to show "No Models Found"
        resolve({
          models: [],
          hookups: [],
        });
      }, 8000); // Reduced to 8 seconds for Firefox

      let modelsData: any[] = [];
      let hokupsData: HookupProps[] = [];
      let modelsReceived = false;
      let hookupsReceived = false;

      let cleanup = () => {
        clearTimeout(timeout);
        this.socket?.off("models-update", handleModelsUpdate);
        this.socket?.off("hookup-update", handleHookupUpdate);
      };

      const checkComplete = () => {
        // Resolve when both events have been received (even if empty)
        if (modelsReceived && hookupsReceived) {
          cleanup();
          resolve({
            models: modelsData,
            hookups: hokupsData,
          });
        }
      };

      const handleModelsUpdate = (data: any) => {
        this.debugLog("Received models update", data);
        modelsReceived = true;
        if (data?.models && Array.isArray(data.models)) {
          modelsData = data.models;
          this.debugLog(`Got ${data.models.length} models`);
        } else {
          modelsData = []; // Explicitly set empty array
          this.debugLog("No models in response");
        }
        checkComplete();
      };

      const handleHookupUpdate = (data: any) => {
        this.debugLog("Received hookup update", data);
        hookupsReceived = true;
        if (data?.hookups && Array.isArray(data.hookups)) {
          hokupsData = data.hookups;
          this.debugLog(`Got ${data.hookups.length} hookups`);
        } else {
          hokupsData = []; // Explicitly set empty array
          this.debugLog("No hookups in response");
        }
        checkComplete();
      };

      // Send location data if available
      const locationData = this.getUserLocationData();
      if (locationData) {
        this.debugLog("Sending user location", locationData);
        this.socket.emit("user-location", locationData);
      }

      // Listen for responses
      this.socket.on("models-update", handleModelsUpdate);
      this.socket.on("hookup-update", handleHookupUpdate);

      // Firefox-specific: Add connection error handling
      if (this.isFirefox()) {
        const handleConnectionError = (error: any) => {
          this.debugLog("Connection error detected", error);
          cleanup();
          resolve({
            models: [],
            hookups: [],
          });
        };

        this.socket.on("connect_error", handleConnectionError);
        this.socket.on("disconnect", handleConnectionError);

        // Clean up error listeners
        const originalCleanup = cleanup;
        cleanup = () => {
          this.socket?.off("connect_error", handleConnectionError);
          this.socket?.off("disconnect", handleConnectionError);
          originalCleanup();
        };
      }

      // Request data
      this.debugLog("Emitting pool-models-and-hookup request");
      this.socket.emit("pool-models-and-hookup");
    });
  }

  // Send user location to server
  sendUserLocation(): void {
    const locationData = this.getUserLocationData();
    if (locationData && this.socket) {
      this.debugLog("Manually sending user location", locationData);
      this.socket.emit("user-location", locationData);
    } else {
      this.debugLog("Cannot send location", {
        hasLocation: !!locationData,
        hasSocket: !!this.socket,
      });
    }
  }

  // Get all models
  async fetchAllModels(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not available"));
        return;
      }

      const timeout = setTimeout(() => {
        this.socket?.off("all-models-update", handleResponse);
        reject(new Error("Request timeout"));
      }, 10000);

      const handleResponse = (data: any) => {
        clearTimeout(timeout);
        this.socket?.off("all-models-update", handleResponse);
        resolve(data?.models || []);
      };

      this.socket.on("all-models-update", handleResponse);
      this.socket.emit("get-all-models");
    });
  }

  // Get all hookups
  async fetchAllHookups(): Promise<HookupProps[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not available"));
        return;
      }

      const timeout = setTimeout(() => {
        this.socket?.off("all-hookups-update", handleResponse);
        reject(new Error("Request timeout"));
      }, 10000);

      const handleResponse = (data: any) => {
        clearTimeout(timeout);
        this.socket?.off("all-hookups-update", handleResponse);
        resolve(data?.hookups || []);
      };

      // Send location for better matching
      const locationData = this.getUserLocationData();
      if (locationData) {
        this.socket.emit("user-location", locationData);
      }

      this.socket.on("all-hookups-update", handleResponse);
      this.socket.emit("get-all-hookups");
    });
  }
}

// Export singleton instance
export const modelsService = new ModelsService();
export default modelsService;
