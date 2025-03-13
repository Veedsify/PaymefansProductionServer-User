"use client";
import {usePathname} from "next/navigation";
import React from "react";

const PATHNAME_TITLES: { [key: string]: string } = {
    "benefits": "Model Benefits",
    "become-a-model": "Become a Model",
    "posts/points": "Points",
    "profile": "Profile",
    "points": "Add Funds",
    "wallet": "Wallet",
    "posts": "Posts",
    "live": "Live",
    "models": "Models/Creators",
    "groups/settings": "Settings",
    "settings": "Settings & Privacy",
    "hookup": "Hookup",
    "verification": "Public Verification",
    "help": "Help & Support",
    "notifications": "Notifications",
    "messages": "Messages",
    "store": "Store",
    "chats": "Chats",
    "search": "Search",
    "story": "Story",
    "groups": "Groups",
};

const HeaderTitle = React.memo(() => {
    const pathname = usePathname();
    if (pathname.startsWith("/live")) return null;
    const title = Object.entries(PATHNAME_TITLES)
        .find(([key]) => pathname.includes(key))?.[1] || "Home";
    return <h1 className="hidden text-lg font-bold lg:block">{title}</h1>;
});

HeaderTitle.displayName = "HeaderTitle";

export default HeaderTitle;
