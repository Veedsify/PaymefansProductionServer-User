import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/Axios";

interface LocationData {
  latitude: number;
  longitude: number;
}

interface UseLocationUpdateOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useLocationUpdate = (options?: UseLocationUpdateOptions) => {
  const queryClient = useQueryClient();

  // Mutation for sending location to server
  const locationMutation = useMutation({
    mutationFn: async (locationData: LocationData) => {
      const response = await axiosInstance.post("/hookup/location", {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });

      if (response.data?.error) {
        throw new Error(response.data.message || "Failed to update location");
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate hookups data to refetch with new location
      queryClient.invalidateQueries({ queryKey: ["modelsAndHookups"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Error updating location:", error);
      options?.onError?.(error);
    },
  });

  // Get user location from localStorage
  const getUserLocationData = useCallback((): LocationData | null => {
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
  }, []);

  // Send current location to server
  const updateLocation = useCallback(() => {
    const locationData = getUserLocationData();
    if (locationData) {
      locationMutation.mutate(locationData);
    } else {
      console.log("No location data available to send");
    }
  }, [locationMutation, getUserLocationData]);

  // Get fresh location from browser and send to server
  const updateLocationFromBrowser = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // Update localStorage
          const storedLocationData = {
            ...locationData,
            timestamp: Date.now(),
            reliable: position.coords.accuracy <= 100,
            consentGiven: true,
          };
          localStorage.setItem("userLocation", JSON.stringify(storedLocationData));

          // Send to server
          locationMutation.mutate(locationData);
        },
        (error) => {
          console.error("Error getting fresh location:", error);
          options?.onError?.(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      const error = new Error("Geolocation is not supported by this browser");
      options?.onError?.(error);
    }
  }, [locationMutation, options]);

  return {
    updateLocation,
    updateLocationFromBrowser,
    getUserLocationData,
    isUpdating: locationMutation.isPending,
    error: locationMutation.error,
    isError: locationMutation.isError,
    isSuccess: locationMutation.isSuccess,
  };
};

export default useLocationUpdate;
