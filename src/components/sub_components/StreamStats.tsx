import { useUserAuthContext } from "@/lib/UserUseContext";
import { StreamStatsProp } from "@/types/Components";
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideMic,
  LucideMicOff,
  LucideThumbsUp,
  LucideUsers,
  LucideVideo,
  LucideVideoOff,
  LucideView,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import LiveStreamSocket from "@/components/custom-hooks/LiveStreamSocket";
import numeral from "numeral";

const StreamStats = ({
  streamData,
  devices,
  handleCameraChange,
  handleCamDisable,
  handleMuteMic,
  isCamEnabled,
  isMicEnabled,
  handleCreateStream,
  handleLiveStreamEnd,
  participantCount,
}: StreamStatsProp) => {
  const [isStatsOpen, setStatsOpen] = useState<boolean>(false);
  const { user } = useUserAuthContext();
  const toggleStats = () => setStatsOpen(!isStatsOpen);
  const { views, likes, commentsCount } = LiveStreamSocket({
    streamId: streamData.stream_id,
  });
  return (
    <div
      className={`border h-full duration-300 ease-in-out dark:border-slate-800 flex-col p-2 md:p-4 w-full ${isStatsOpen ? "left-0" : "-left-full"} lg:flex lg:static bg-white z-50 absolute top-0`}
    >
      <div
        className={`absolute flex items-center justify-center lg:hidden shadow-sm ${!isStatsOpen ? "-right-12" : "right-0"} h-12 w-12 top-10 bg-white p-3 rounded-tr-full rounded-br-full ${!isStatsOpen && "hover:-right-16 hover:w-16"} duration-200`}
      >
        <button
          onClick={toggleStats}
          className="flex items-center justify-center"
        >
          {isStatsOpen ? (
            <LucideChevronLeft size={40} />
          ) : (
            <LucideChevronRight size={40} />
          )}
        </button>
      </div>
      <div className="mb-14">
        <Image
          className="block h-8 w-36"
          width={150}
          height={30}
          priority
          src="/site/logo2.png"
          alt="Logo"
        />
      </div>
      <div className="mb-20">
        <span className="font-semibold mb-2 text-sm text-gray-700 inline-block dark:text-gray-300">
          Stream Title
        </span>
        <input
          type="text"
          readOnly
          className="text-2xl font-bold border-none w-full p-1"
          value={streamData?.title}
        />
      </div>
      {user?.user_id === streamData?.user_id && (
        <>
          <div className="mb-3">
            <span className="font-bold mb-2 text-sm inline-block text-gray-700 dark:text-gray-300">
              Stream Analytics
            </span>
            <div className="flex mb-2">
              {[
                {
                  icon: <LucideView size={15} />,
                  label: "Views",
                  count: views > 1000 ? numeral(views).format("0.0a") : views,
                },
                {
                  icon: <LucideThumbsUp size={15} />,
                  label: "Likes",
                  count: likes > 1000 ? numeral(likes).format("0.0a") : likes,
                },
                {
                  icon: <MessageCircle size={15} />,
                  label: "Comments",
                  count:
                    commentsCount > 1000
                      ? numeral(commentsCount).format("0.0a")
                      : commentsCount,
                },
              ].map(({ icon, label, count }, index) => (
                <div
                  key={index}
                  className={`border flex items-center flex-col justify-center gap-2 border-gray-300 dark:border-slate-800 p-3 flex-1 ${index === 0 ? "rounded-tl-lg rounded-bl-lg" : index === 2 ? "rounded-tr-lg rounded-br-lg" : ""}`}
                >
                  {icon}
                  <h2 className="text-sm">{label}</h2>
                  <h1 className="text-lg sm:text-3xl font-semibold">{count}</h1>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <span className="font-bold text-sm mb-2 inline-block text-gray-700 dark:text-gray-300">
              User Analytics
            </span>
            <div className="flex mb-2 flex-wrap">
              {[
                {
                  icon: (
                    <Image
                      width={20}
                      height={20}
                      src="/site/coin.svg"
                      className="w-5 h-5 aspect-square"
                      alt="Coin"
                    />
                  ),
                  label: "Points",
                  count: "2.3k",
                },
                {
                  icon: <LucideUsers size={15} />,
                  label: "Followers",
                  count: "130",
                },
              ].map(({ icon, label, count }, index) => (
                <div
                  key={index}
                  className={`border flex items-center flex-col justify-center gap-2 border-gray-300 dark:border-slate-800 p-3 flex-1 ${index === 0 ? "rounded-tl-lg rounded-bl-lg" : ""}`}
                >
                  {icon}
                  <h2 className="text-sm">{label}</h2>
                  <h1 className="text-lg sm:text-2xl font-semibold">{count}</h1>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="border flex flex-col gap-2 border-gray-300 dark:border-slate-400 p-3 flex-1 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <div className="border w-full p-3 rounded">
            <h2 className="mb-3 text-sm font-medium">Select Camera</h2>
            <select
              name=""
              onChange={handleCameraChange}
              className="p-3 text-sm w-full truncate overflow-ellipsis border rounded bg-gray-100"
            >
              {devices &&
                devices.length > 0 &&
                devices.map((device, index: number) => (
                  <option key={index} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="border flex w-full rounded">
            <div className="p-3 flex-1 border-r">
              <h2 className="mb-3 text-sm font-medium">Mute Microphone</h2>
              <button onClick={handleMuteMic}>
                {!isMicEnabled ? (
                  <span className="border inline-block p-3 rounded-full">
                    <LucideMicOff stroke="#f00" size={30} />
                  </span>
                ) : (
                  <span className="border inline-block p-3 rounded-full">
                    <LucideMic stroke="green" size={30} />
                  </span>
                )}
              </button>
            </div>
            <div className="p-3 flex-1">
              <h2 className="mb-3 text-sm font-medium">Disable Video</h2>
              <button onClick={handleCamDisable}>
                {!isCamEnabled ? (
                  <span className="border inline-block p-3 rounded-full">
                    <LucideVideoOff stroke="#f00" size={30} />
                  </span>
                ) : (
                  <span className="border inline-block p-3 rounded-full">
                    <LucideVideo stroke="green" size={30} />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={handleLiveStreamEnd}
          className="bg-red-500 text-white p-3 rounded-lg w-full mt-5 font-semibold text-lg"
        >
          {user?.user_id === streamData?.user_id
            ? "End Stream"
            : "Leave Stream"}
        </button>
        <button
          onClick={handleCreateStream}
          className="bg-emerald-600 text-white p-3 rounded-lg w-full mt-5 font-semibold"
        >
          {user?.user_id === streamData?.user_id ? "Go Live" : "Join Stream"}
        </button>
      </div>
    </div>
  );
};

export default StreamStats;
