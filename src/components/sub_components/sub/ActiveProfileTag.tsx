"use client";

import {
  ActiveProfileTagProps,
  handleActiveUsersProps,
} from "@/types/Components";
import { useEffect, useState } from "react";
import { getSocket } from "./Socket";

// Store state per userid
const activeStateMap = new Map<
  string,
  { active: boolean; lastActivityTime: number }
>();

const ActiveProfileTag = ({
  userid: username,
  withText,
  scale,
}: ActiveProfileTagProps) => {
  // Initialize from map or defaults
  const [active, setActive] = useState(
    () => activeStateMap.get(username)?.active ?? false
  );
  const [lastActivityTime, setLastActivityTime] = useState(
    () => activeStateMap.get(username)?.lastActivityTime ?? Date.now()
  );
  const verifiedUsers = ["@paymefans", "@paymefans1", "@paymefans2"];
  const shouldHide = !verifiedUsers.includes(username);

  const socket = getSocket();

  useEffect(() => {
    if (!socket.active) {
      setActive(false);
      activeStateMap.set(username, { active: false, lastActivityTime });
      return;
    }

    const handleActiveUsers = (users: handleActiveUsersProps[]) => {
      console.log("Active users received:", users);
      const isActive = users.some((user) => user.username === username);
      setActive(isActive);
      if (isActive) {
        const now = Date.now();
        setLastActivityTime(now);
        activeStateMap.set(username, { active: true, lastActivityTime: now });
      } else {
        activeStateMap.set(username, { active: false, lastActivityTime });
      }
    };

    socket.on("active_users", handleActiveUsers);

    return () => {
      socket.off("active_users", handleActiveUsers);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, socket]);

  useEffect(() => {
    activeStateMap.set(username, { active, lastActivityTime });
  }, [active, lastActivityTime, username]);

  useEffect(() => {
    const checkForInactivity = () => {
      if (Date.now() - lastActivityTime > 10000) {
        socket.emit("inactive");
        setActive(false);
        activeStateMap.set(username, { active: false, lastActivityTime });
      }
    };

    const intervalId = setInterval(checkForInactivity, 1000);

    return () => clearInterval(intervalId);
  }, [lastActivityTime, socket, username]);

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
