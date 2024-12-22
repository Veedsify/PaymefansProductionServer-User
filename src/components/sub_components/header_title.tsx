"use client";
import {usePathname} from "next/navigation";

const HeaderTitle = () => {
    const pathname = usePathname();
    return (
        <>
            {!pathname.startsWith("/live") && (
                <h1 className="hidden text-lg font-bold lg:block">
                    {pathname.includes("benefits")
                        ? "Model Benefits"
                        : pathname.includes("become-a-model")
                            ? "Become a Model"
                            : pathname.includes("profile")
                                ? "Profile"
                                : pathname.includes("points")
                                    ? "Add Funds"
                                    : pathname.includes("wallet")
                                        ? "Wallet"
                                        : pathname.includes("posts")
                                            ? "Posts"
                                            : pathname.includes("live")
                                                ? "Live"
                                                : pathname.includes("models")
                                                    ? "Models/Creators"
                                                    : pathname.includes("settings")
                                                        ? "Settings & Privacy"
                                                        : pathname.includes("hookup")
                                                            ? "Hookup"
                                                            : pathname.includes("verification")
                                                                ? "Public Verification"
                                                                : pathname.includes("help")
                                                                    ? "Help & Support"
                                                                    : pathname.includes("notifications")
                                                                        ? "Notifications"
                                                                        : "Home"}
                </h1>
            )}
        </>
    );
};

export default HeaderTitle;
