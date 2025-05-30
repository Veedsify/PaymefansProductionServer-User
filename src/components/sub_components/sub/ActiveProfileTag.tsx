"use client";

import {
  ActiveProfileTagProps,
  handleActiveUsersProps,
} from "@/types/components";
import { useEffect, useState } from "react";
import { getSocket } from "./socket";

const ActiveProfileTag = ({
  userid: username,
  withText,
  scale,
}: ActiveProfileTagProps) => {
  const [active, setActive] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const verifiedUsers = ["@paymefans", "@paymefans1", "@paymefans2"];
  const shouldHide = !verifiedUsers.includes(username);

  const socket = getSocket();

  useEffect(() => {
    if (!socket.active) {
      setActive(false);
      return;
    }

    const handleActiveUsers = (users: handleActiveUsersProps[]) => {
      const isActive = users.some((user) => user.username === username);
      setActive(isActive);
      if (isActive) {
        setLastActivityTime(Date.now());
      }
    };

    socket.on("active_users", handleActiveUsers);

    return () => {
      socket.off("active_users", handleActiveUsers);
    };
  }, [username, socket]);

  useEffect(() => {
    const checkForInactivity = () => {
      if (Date.now() - lastActivityTime > 10000) {
        // 10 seconds of inactivity
        socket.emit("inactive");
        setActive(false);
      }
    };

    const intervalId = setInterval(checkForInactivity, 1000);

    return () => clearInterval(intervalId);
  }, [lastActivityTime, socket]);

  return (
    <div className="flex items-center gap-2">
      {shouldHide && (
        <>
          <span
            style={{ scale: scale ? scale : 1 }}
            className={`p-1 ${
              active ? "bg-green-500" : "bg-gray-300"
            } inline-block w-1 h-1 rounded-full`}
          ></span>
          {withText && <p>{active ? "Online" : "Offline"}</p>}
        </>
      )}
    </div>
  );
};

export default ActiveProfileTag;
