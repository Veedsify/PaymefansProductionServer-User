"use client";

import { AuthUserProps } from "@/types/User";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Eye, X, Check } from "lucide-react";
import { getSocket } from "@/components/sub_components/sub/Socket";
import axiosInstance from "@/utils/Axios";

export default function GetLocationContext({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthUserProps | null;
}) {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "pending" | "granted" | "denied" | null
  >(null);
  const socket = getSocket();

  // Function to send location data to the server
  const sendLocationToServer = useCallback(
    async (locationData: any) => {
      try {
        // Send via API
        await axiosInstance.post("/hookup/location", {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });

        // Also send via socket for real-time updates
        socket.emit("user-location", {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });
      } catch (error) {
        console.error("Error sending location to server:", error);
      }
    },
    [socket],
  );

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
      console.error("User data is not available.");
      return;
    }

    if (user.is_model && user.Model?.hookup) {
      // Check if location permission was already handled
      const locationRequested = sessionStorage.getItem("locationRequested");
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
    } else {
      updateLocationInBackground();
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
          sessionStorage.setItem("locationRequested", "true");

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
          sessionStorage.setItem("locationRequested", "true");
          sessionStorage.setItem("locationDeclined", "true");

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
    sessionStorage.setItem("locationRequested", "true");
    sessionStorage.setItem("locationDeclined", "true");
  };

  const benefits = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "Enable location for Hook up",
      description: "Let potential clients know you're active in their area",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Location-Based Matching",
      description: "Connect with clients looking for models nearby",
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Increased Visibility",
      description: "Appear in local searches and recommendations",
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
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLocationDecline}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <MapPin className="w-8 h-8" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-center mb-2"
                >
                  Share Your Location
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-white/90"
                >
                  Let others find you nearby
                </motion.p>
              </div>

              {/* Content */}
              <div className="p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4 mb-6"
                >
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold dark:text-white text-gray-900 mb-1">
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
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-6"
                >
                  <p className="text-xs text-gray-600 text-center dark:text-white">
                    🔒 Your exact location is never shared. We only show your
                    general area to help with matching.
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
                    className="w-full bg-primary-dark-pink hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
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
                        <span>Enable my location</span>
                      </>
                    )}
                  </motion.button>

                  {locationStatus !== "granted" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLocationDecline}
                      className="w-full border border-gray-300 hover:border-gray-400 dark:text-white text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                    >
                      Maybe Later
                    </motion.button>
                  )}
                </motion.div>

                {locationStatus === "denied" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-600 text-center">
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
