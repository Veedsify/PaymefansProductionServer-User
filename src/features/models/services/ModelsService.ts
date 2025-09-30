import type { HookupProps } from "@/features/models/comps/SideModels";
import axiosInstance from "@/utils/Axios";

interface ModelsAndHookupsResponse {
  models: any[];
  hookups: HookupProps[];
}

interface LocationData {
  latitude: number;
  longitude: number;
}

class ModelsService {
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

  // Fetch models via HTTP API
  async fetchModels(): Promise<any[]> {
    try {
      const response = await axiosInstance.post(
        "/models/all",
        {
          limit: 3,
        },
        {
          withCredentials: true,
        },
      );

      if (response.data?.error) {
        throw new Error(response.data.message || "Failed to fetch models");
      }

      return response.data?.models || [];
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  }

  // Fetch hookups via HTTP API
  async fetchHookups(): Promise<HookupProps[]> {
    try {
      const locationData = this.getUserLocationData();
      const queryParams = new URLSearchParams();

      if (locationData) {
        queryParams.append("latitude", locationData.latitude.toString());
        queryParams.append("longitude", locationData.longitude.toString());
      }

      const response = await axiosInstance.get(
        `/hookup/nearby?${queryParams.toString()}`,
      );

      if (response.data?.error) {
        throw new Error(response.data.message || "Failed to fetch hookups");
      }

      return response.data?.hookups || [];
    } catch (error) {
      console.error("Error fetching hookups:", error);
      return [];
    }
  }

  // Fetch both models and hookups
  async fetchModelsAndHookups(): Promise<ModelsAndHookupsResponse> {
    try {
      const [models, hookups] = await Promise.all([
        this.fetchModels(),
        this.fetchHookups(),
      ]);

      return {
        models,
        hookups,
      };
    } catch (error) {
      console.error("Error fetching models and hookups:", error);
      return {
        models: [],
        hookups: [],
      };
    }
  }

  // Send user location to server via HTTP
  async sendUserLocation(): Promise<void> {
    const locationData = this.getUserLocationData();
    if (!locationData) {
      console.log("No location data available to send");
      return;
    }

    try {
      await axiosInstance.post("/hookup/location", {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
      console.log("Location sent successfully via HTTP");
    } catch (error) {
      console.error("Error sending location via HTTP:", error);
    }
  }

  // Get all models for models page
  async fetchAllModels(): Promise<any[]> {
    try {
      const response = await axiosInstance.post("/models/all", {
        limit: 50, // Get more models for the full page
      });

      if (response.data?.error) {
        throw new Error(response.data.message || "Failed to fetch all models");
      }

      return response.data?.models || [];
    } catch (error) {
      console.error("Error fetching all models:", error);
      return [];
    }
  }

  // Search models
  async searchModels(searchQuery: string): Promise<any[]> {
    try {
      const response = await axiosInstance.get("/model/search-models", {
        params: { q: searchQuery },
      });

      if (response.data?.error) {
        throw new Error(response.data.message || "Failed to search models");
      }

      return response.data?.models || [];
    } catch (error) {
      console.error("Error searching models:", error);
      return [];
    }
  }

  // Get models available for hookup
  async fetchHookupModels(): Promise<any[]> {
    try {
      const response = await axiosInstance.post("/model/hookups", {});

      if (response.data?.error) {
        throw new Error(
          response.data.message || "Failed to fetch hookup models",
        );
      }

      return response.data?.models || [];
    } catch (error) {
      console.error("Error fetching hookup models:", error);
      return [];
    }
  }
}

// Export singleton instance
export const modelsService = new ModelsService();
