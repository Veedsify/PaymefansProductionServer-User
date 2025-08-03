"use client";
import "@/app/globals.css";
import Image from "next/image";
import { LucidePin, LucideSend } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import StreamStats from "../sub_components/StreamStats";
import { AuthUserProps } from "@/types/User";
import swal from "sweetalert";
import { useRouter } from "next/navigation";
import { streamDataProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";

const StreamDeckCamera = ({
  thisUser,
  streamData,
}: {
  thisUser: AuthUserProps | null;
  streamData: streamDataProps;
}) => {
  const token = getToken();
  const router = useRouter();
  const [isLive, setIsLive] = useState(false);
  const [isCamEnabled, setIsCamEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);
  const [devices, setDevices] = useState<any[]>([]);

  const handleLiveStreamEnd = () => {
    const endStream = async () => {
      if (streamData.user_id === thisUser?.user_id) {
        swal({
          title: "End Stream",
          text: "Are you sure you want to end the stream?",
          icon: "warning",
          dangerMode: true,
          buttons: {
            cancel: true,
            confirm: {
              text: "End Stream",
              closeModal: true,
              value: true,
            },
          },
        }).then((confirmed) => {
          if (confirmed) {
            axiosInstance
              .post(
                `/stream/${streamData.stream_id}/go-live`,
                {
                  action: "stop-live",
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then((res) => {
                if (res.status === 200) {
                }
              })
              .catch((err) => {
                console.log(err);
                toast.error("You are not authorized to go live");
              });
            toast.success("Stream has ended");
            router.push("/profile");
          } else {
            router.push("/");
          }
        });
      } else {
        swal({
          title: "Leave Stream",
          text: "Are you sure you want to leave the stream?",
          icon: "warning",
          dangerMode: true,
          buttons: {
            cancel: true,
            confirm: {
              text: "Leave Stream",
              closeModal: true,
              value: true,
            },
          },
        }).then((confirmed) => {
          if (confirmed) {
            router.push("/");
          }
        });
      }
    };
    endStream();
  };
  const toggleMic = async () => {
    if (true) {
      toast.success("Microphone is muted");
    } else {
      toast.success("Microphone is unmuted");
    }
  };

  const toggleCamera = async () => {
    if (true) {
      toast.success("Camera is disabled");
    } else {
      toast.success("Camera is enabled");
    }
  };

  const handleCameraChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedDeviceId = e.target.value;
    toast.success("Camera changed");
  };

  const handleCreateStream = async () => {
    if (streamData.user_id === thisUser?.user_id) {
      axiosInstance
        .post(
          `/stream/${streamData.stream_id}/go-live`,
          {
            action: "go-live",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 200) {
            toast.success("You are now live");
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("You are not authorized to go live");
        });
    } else if (true) {
    } else {
      toast.error("You are not authorized to go live");
    }
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex flex-col items-center w-full bg-white dark:bg-gray-950 min-h-dvh">
      <div className="relative flex-1 w-full h-full border dark:border-slate-800 grid lg:grid-cols-3  dark:text-white">
        <StreamStats
          handleCreateStream={handleCreateStream}
          devices={devices}
          handleCamDisable={toggleCamera}
          streamData={streamData}
          handleCameraChange={handleCameraChange}
          isCamEnabled={isCamEnabled}
          isMicEnabled={isMicEnabled}
          handleMuteMic={toggleMic}
          isLive={isLive}
          participantCount={participantCount}
          handleLiveStreamEnd={handleLiveStreamEnd}
        />
        <div className="relative flex flex-col w-full h-full border dark:border-slate-800">
          <div
            className={`h-full gap-2 w-full`}
            style={{
              flex: "1",
              display: "grid",
              gridTemplateColumns: "1fr",
              gridTemplateRows: "1fr",
            }}
          >
            {true && <></>}
            {/* {participants.map((participant) => (
                                   <div className="object-cover w-full h-full row-span-1" key={participant.userId}>
                                        <ParticipantView participant={participant} />
                                   </div>
                              ))} */}
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full border dark:border-slate-800 lg:relative lg:block">
          <div className="absolute bottom-0 left-0 w-full bg-video-stream-gradient-white">
            {[
              {
                imgSrc: "/images/user.png",
                userName: "@jenna",
                userComment:
                  "Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
              },
              {
                imgSrc: "/images/user.png",
                userName: "@jenna",
                userComment:
                  "Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
              },
            ].map(({ imgSrc, userName, userComment }, index) => (
              <div key={index} className="flex items-center p-2 md:p-3 gap-4">
                <Image
                  src={imgSrc}
                  alt="User"
                  width={60}
                  height={60}
                  className="object-cover w-12 h-12 border rounded-full border-primary-dark-pink"
                />
                <div>
                  <span className="block text-xs font-bold dark:text-white">
                    <Link href="/user/username">{userName}</Link>
                  </span>
                  <span className="text-xs font-medium dark:text-white">
                    {userComment}
                  </span>
                </div>
              </div>
            ))}
            <div className="p-4 pb-10">
              <form className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 w-full p-3 text-xs font-medium text-white bg-transparent border border-white outline-none dark:border-white lg:border-gray-600 rounded-md lg:text-black"
                  placeholder="Type your comment..."
                />
                <button
                  type="submit"
                  className="p-3 bg-primary-dark-pink rounded-md"
                >
                  <LucidePin stroke="#fff" size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamDeckCamera;
