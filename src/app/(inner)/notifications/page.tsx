import type { Metadata } from "next";
import dynamic from "next/dynamic";

const NotificationHeader = dynamic(
  () => import("@/features/notifications/Notifications"),
  { ssr: false }
);

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
