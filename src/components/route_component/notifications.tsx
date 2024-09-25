"use client"
import { NotificationIcontypes, useNotificationStore } from "@/contexts/notification-context";
import { getToken } from "@/utils/cookie.get";
import axios from "axios";
import { LucideLoader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Notify() {
    return (
        <div>
            Enter
        </div>
    );
}

export function NotificationHeader({ children, className }: { children: string; className?: string }) {
    const { notifications } = useNotificationStore()
    const [count, setCount] = useState<number>(0)
    useEffect(() => {
        const allUnreadNotifications = notifications.filter(note => note.read == false)
        setCount(allUnreadNotifications.length)
    }, [notifications])

    return (
        <>
            <div className={className}>
                <div className="flex items-center mb-7">
                    <span className="font-bold text-xl flex-shrink-0 dark:text-white">{children}</span>
                    <div className="flex items-center justify-center w-8 h-8 aspect-square flex-shrink-0 ml-auto text-white md:py-3 md:px-3 py-1 px-1  bg-primary-text-dark-pink rounded-full font-bold">{
                        count > 100 ? "99+" : count
                    }</div>
                </div>
            </div >
            <NotificationBody />
        </>
    );
}

export function NotificationBody() {
    const { notifications, updateNotification } = useNotificationStore()
    const types = NotificationIcontypes;
    const token = getToken()
    const handleNotificationClick = async (url: string, notification_id: string, id: number, read: boolean) => {
        if (read) return
        if (url && url !== "") {
            const readUrl = `${process.env.NEXT_PUBLIC_EXPRESS_URL}/read-notification/${id}`;
            const readNotification = await axios.get(readUrl, { headers: { "Authorization": `Bearer ${token}` } })
            if (readNotification.status === 200) {
                updateNotification(notification_id)
                window.location.href = url
            }
        } else {
            return
        }
    }

    return (
        <div>
            {(!notifications || notifications.length) === 0 ? (
                <div className="text-center py-2">
                    No Notifications yet
                </div>
            ) : notifications.map((notification, index) => (
                <div key={index}
                    onClick={() => handleNotificationClick(notification.url, notification.notification_id, notification.id, notification.read)}
                >
                    <div
                        className={`w-full mt-3 select-none ${index + 1 === notifications.length && "border-b"} border-b border-gray-50 dark:border-slate-800 p-3 rounded flex items-center hover:border border-none dark:hover:bg-slate-800 dark:text-white hover:bg-gray-100 
                        ${notification.read === false ? "bg-messages-unread dark:bg-gray-800 cursor-pointer" : "bg-white dark:bg-gray-950 cursor-default"}
                        `}>
                        <div role="img"
                            style={{ color: types.find((type) => type.type === notification.action)?.color }}
                            className="focus:outline-none w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center">
                            {
                                notification.action && types.find((type) => type.type === notification.action)?.icon
                            }
                        </div>
                        <div className="pl-7 space-y-3">
                            <p className="focus:outline-none leading-none max-w-[80%] notification_message_container">
                                <span dangerouslySetInnerHTML={{ __html: notification.message }}></span>
                            </p>
                            <p className="focus:outline-none text-sm leading-3 pt-1 text-gray-500">
                                {
                                    new Date(notification.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric'
                                    })
                                }
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}



export default Notify;