import { AuthUserProps } from "@/features/user/types/user";
import Image from "next/image";
import Link from "next/link";

const socialLinks = [
    {
        key: "instagram_url",
        label: "Instagram",
        icon: "/images/social/instagram.svg",
        alt: "Instagram",
        color: "hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-400 hover:text-white",
    },
    {
        key: "facebook_url",
        label: "Facebook",
        icon: "/images/social/facebook.svg",
        alt: "Facebook",
        color: "hover:bg-blue-600 hover:text-white",
    },
    {
        key: "twitter_url",
        label: "Twitter",
        icon: "/images/social/twitter.svg",
        alt: "Twitter",
        color: "hover:bg-blue-400 hover:text-white",
    },
    {
        key: "tiktok_url",
        label: "TikTok",
        icon: "/images/social/tiktok.svg",
        alt: "TikTok",
        color: "hover:bg-black hover:text-white",
    },
    {
        key: "snapchat_url",
        label: "Snapchat",
        icon: "/images/social/snapchat.svg",
        alt: "Snapchat",
        color: "hover:bg-yellow-400 hover:text-black",
    },
    {
        key: "telegram_url",
        label: "Telegram",
        icon: "/images/social/telegram.svg",
        alt: "Telegram",
        color: "hover:bg-blue-500 hover:text-white",
    },
    {
        key: "youtube_url",
        label: "YouTube",
        icon: "/images/social/youtube.svg",
        alt: "YouTube",
        color: "hover:bg-red-600 hover:text-white",
    },
];

const ProfileSocialLinks = ({ Settings }: { Settings: AuthUserProps["Settings"] }) => {
    return (
        <div className="flex flex-wrap items-center mb-2 text-sm font-semibold text-gray-700 gap-3 dark:text-gray-300">
            {socialLinks.map(({ key, label, icon, alt, color }) =>
                Settings?.[key as keyof typeof Settings] ? (
                    <Link
                        key={key}
                        href={Settings[key as keyof typeof Settings] as string}
                        target="_blank"
                        className={`flex gap-2 items-center rounded-full w-32 h-12 border border-gray-200 dark:border-gray-700 p-1 transition-all duration-200 bg-white dark:bg-gray-800 ${color} focus:ring-2 focus:ring-offset-2 focus:ring-blue-400`}
                    >
                        <Image width={100} height={100} src={icon} alt={alt} className="rounded-full w-9 h-9" />
                        <span className="truncate">{label}</span>
                    </Link>
                ) : null
            )}
        </div>
    );
};

export default ProfileSocialLinks;
