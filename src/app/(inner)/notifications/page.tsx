import type { Metadata } from "next";
import {
  NotificationBody,
  NotificationHeader,
} from "@/features/notifications/Notifications";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Notifications",
};

const Notifications = () => {
  return (
    <div>
      <div className="p-3 md:py-5 md:px-8">
        <NotificationHeader>Notifications</NotificationHeader>
      </div>
    </div>
  );
};

export default Notifications;
