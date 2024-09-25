import { NotificationBody, NotificationHeader } from "@/components/route_component/notifications";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Notifications",
    description: "Notifications",
}

const Notifications = () => {
    return (
        <div>
            <div className="md:py-5 md:px-8 p-3">
                <NotificationHeader className="border-b">
                    Notifications
                </NotificationHeader>
            </div>
        </div>
    );
}

export default Notifications;