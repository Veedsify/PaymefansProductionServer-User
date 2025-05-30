import SettingsTab from "@/components/route_component/SettingsTab";
import { Metadata } from "next";
import Image from "next/image";
import getUserData from "@/utils/data/UserData";

export const metadata: Metadata = {
    title: "Setings & Privacy | Paymefans",
    description: "Profile page",
}
const Settings = async () => {
    const user = await getUserData()
    return (
        <div className="p-4 lg:mb-4 mb-20">
            <div className="border-[3px] border-black/30 mb-3 inline-block p-2 rounded-full border-dotted">
                <Image
                    src={`${user?.profile_image}`}
                    alt=""
                    width={100}
                    priority
                    height={100}
                    className="object-cover w-20 h-20 rounded-full lg:w-24 lg:h-24 aspect-square "
                />
            </div>

            {/* <form onSubmit={(e) => e.preventDefault()} action=""> */}
            <SettingsTab user={user} />
        </div>
    );
};

export default Settings;
