"use client";

import { ActiveProfileTagProps } from "@/types/Components";
import { useEffect } from "react";
import { getSocket } from "./Socket";
import { useActiveUsersManager } from "@/context/ActiveUsersManagerContext";

// ActiveProfileTag component
const ActiveProfileTag = ({
  userid: username,
  withText,
  scale,
}: ActiveProfileTagProps) => {
  // Handle undefined/null username - return early to prevent any processing
  if (!username || username.trim() === "") {
    return null; // Don't render anything if no valid username
  }

  const isActive = useActiveUsersManager((state) => state.isActive(username));
  const updateActiveUsers = useActiveUsersManager(
    (state) => state.updateActiveUsers
  );

  useEffect(() => {
    if (!username || username.trim() === "") {
      return;
    }

    const socket = getSocket(username);
    if (socket.connected) {
      socket.emit("get-active-users");
    }
    const handleActiveUsers = (users: any) => {
      console.log("🚀 Active users received:", users);
      updateActiveUsers(users);
    };

    socket.on("active_users", handleActiveUsers);

    return () => {
      socket.off("active_users", handleActiveUsers);
    };
  }, [username, updateActiveUsers]);

  return (
    <div className="flex items-center gap-2">
      {
        <>
          <span
            style={{ scale: scale ? scale : 1 }}
            className={`p-1 transition-colors duration-200 ${
              isActive ? "bg-green-500" : "bg-gray-300"
            } inline-block w-1 h-1 rounded-full`}
          ></span>
          {withText && (
            <p
              className={`transition-colors duration-200 ${
                isActive ? "text-green-600" : "text-gray-500"
              }`}
            >
              {isActive ? "Online" : "Offline"}
            </p>
          )}
        </>
      }
    </div>
  );
};

export default ActiveProfileTag;
