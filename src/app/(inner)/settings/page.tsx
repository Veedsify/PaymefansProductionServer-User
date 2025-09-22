"use client";
import Image from "next/image";
import { useAuthContext } from "@/contexts/UserUseContext";
import SettingsTab from "@/features/settings/SettingsTab";

const Settings = () => {
  const { user } = useAuthContext();

  if (!user) {
    return <div className="p-4">No user data found</div>;
  }

  return (
    <div className="p-4 mb-20 lg:mb-4">
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
      {user && <SettingsTab user={user} />}
    </div>
  );
};

export default Settings;
