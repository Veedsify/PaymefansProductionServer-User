"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, MapPin, Users, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AuthUserProps } from "@/features/user/types/user";
import axiosInstance from "@/utils/Axios";
import { useAuthContext } from "./UserUseContext";

export default function GetLocationContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isGuest } = useAuthContext();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "pending" | "granted" | "denied" | null
  >(null);

  // Function to send location data to the server via HTTP
  const sendLocationToServer = useCallback(async (locationData: any) => {
    try {
      if (isGuest || !user) return;
      await axiosInstance.post("/hookup/location", {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
      console.log("Location sent successfully via HTTP");
    } catch (error) {
      console.error("Error sending location to server:", error);
    }
  }, []);

  // Function to update location without showing the modal
  const updateLocationInBackground = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            reliable: position.coords.accuracy <= 100,
            consentGiven: true,
            userId: user?.id,
            username: user?.username,
          };

          localStorage.setItem("userLocation", JSON.stringify(locationData));

          // Send location to server
          sendLocationToServer(locationData);
        },
        (error) => {
          console.error("Error updating background location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    }
  }, [user, sendLocationToServer]);

  useEffect(() => {
    if (!user) {
      return;
    }

    // For models with hookup, use session storage (ask every session)
    const isModelWithHookup = user.is_model && user.Model?.hookup;
    const storageKey = isModelWithHookup
      ? "locationRequested"
      : "locationRequested";
    const storage = isModelWithHookup ? sessionStorage : localStorage;

    const locationRequested = storage.getItem(storageKey);
    const hasLocation = localStorage.getItem("userLocation");

    if (!locationRequested) {
      // Small delay to let the page load before showing modal
      setTimeout(() => {
        setShowLocationModal(true);
      }, 1000);
    } else if (hasLocation) {
      // If we already have location, check if it needs updating (older than 30 minutes)
      try {
        const locationData = JSON.parse(hasLocation);
        const isStale = Date.now() - locationData.timestamp > 30 * 60 * 1000;

        if (isStale && locationData.consentGiven) {
          // Update location in background without showing modal
          updateLocationInBackground();
        }
      } catch (error) {
        console.error("Error parsing stored location:", error);
      }
    }
  }, [user, updateLocationInBackground]);

  const handleLocationAccept = async () => {
    setIsLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            reliable: position.coords.accuracy <= 100,
            consentGiven: true,
            userId: user?.id,
            username: user?.username,
          };

          localStorage.setItem("userLocation", JSON.stringify(locationData));

          // Store location permission based on user type
          const isModelWithHookup = user?.is_model && user?.Model?.hookup;
          const storage = isModelWithHookup ? sessionStorage : localStorage;
          storage.setItem("locationRequested", "true");

          // Send location to server
          sendLocationToServer(locationData);
          setLocationStatus("granted");
          setIsLoading(false);

          // Auto close after success animation
          setTimeout(() => {
            setShowLocationModal(false);
          }, 2000);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus("denied");
          setIsLoading(false);

          // Store declined permission based on user type
          const isModelWithHookup = user?.is_model && user?.Model?.hookup;
          const storage = isModelWithHookup ? sessionStorage : localStorage;
          storage.setItem("locationRequested", "true");
          storage.setItem("locationDeclined", "true");

          // Auto close after error
          setTimeout(() => {
            setShowLocationModal(false);
          }, 2000);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    }
  };

  const handleLocationDecline = () => {
    setShowLocationModal(false);

    // Store declined permission based on user type
    const isModelWithHookup = user?.is_model && user?.Model?.hookup;
    const storage = isModelWithHookup ? sessionStorage : localStorage;
    storage.setItem("locationRequested", "true");
    storage.setItem("locationDeclined", "true");
  };

  const benefits = [
    {
      icon: <Users className="w-5 h-5" />,
      title: user?.is_model
        ? "Enable location for Hook up"
        : "Connect with People Nearby",
      description: user?.is_model
        ? "Let potential clients know you're active in their area"
        : "Discover and connect with models and creators in your area",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Location-Based Matching",
      description: user?.is_model
        ? "Connect with clients looking for models nearby"
        : "Find the best local content and services",
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: user?.is_model
        ? "Increased Visibility"
        : "Personalized Experience",
      description: user?.is_model
        ? "Appear in local searches and recommendations"
        : "Get content and recommendations tailored to your location",
    },
  ];

  return (
    <>
      {children}

      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-md overflow-hidden bg-white shadow-2xl dark:bg-gray-900 rounded-2xl"
            >
              {/* Header */}
              <div className="relative p-6 text-white bg-gradient-to-br from-purple-500 to-purple-600">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLocationDecline}
                  className="absolute p-1 rounded-full top-4 right-4 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/20"
                >
                  <MapPin className="w-8 h-8" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-2 text-2xl font-bold text-center"
                >
                  {user?.is_model
                    ? "Share Your Location"
                    : "Enable Location Services"}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-white/90"
                >
                  {user?.is_model
                    ? "Let others find you nearby"
                    : "Discover local content and experiences"}
                </motion.p>
              </div>

              {/* Content */}
              <div className="p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6 space-y-4"
                >
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-white">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Privacy Note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="p-3 mb-6 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <p className="text-xs text-center text-gray-600 dark:text-white">
                    🔒{" "}
                    {user?.is_model
                      ? "Your exact location is never shared. We only show your general area to help with matching."
                      : "Your location data is kept private and secure. We only use it to enhance your experience with local content."}
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="space-y-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLocationAccept}
                    disabled={isLoading || locationStatus === "granted"}
                    className="flex items-center justify-center w-full px-6 py-3 font-semibold text-white rounded-lg bg-primary-dark-pink hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
                        />
                        <span>Getting Location...</span>
                      </>
                    ) : locationStatus === "granted" ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Location Enabled!</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5" />
                        <span>
                          {user?.is_model
                            ? "Enable my location"
                            : "Allow Location Access"}
                        </span>
                      </>
                    )}
                  </motion.button>

                  {locationStatus !== "granted" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLocationDecline}
                      className="w-full px-6 py-3 font-semibold text-gray-700 border border-gray-300 rounded-lg hover:border-gray-400 dark:text-white transition-all duration-200"
                    >
                      Maybe Later
                    </motion.button>
                  )}
                </motion.div>

                {locationStatus === "denied" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 mt-4 border border-red-200 rounded-lg bg-red-50"
                  >
                    <p className="text-sm text-center text-red-600">
                      Location access was denied. You can enable it later in
                      your browser settings.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
