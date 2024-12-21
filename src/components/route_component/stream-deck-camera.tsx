"use client";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "@/app/globals.css";
import {
  useCallStateHooks,
  ParticipantView,
  useCall,
} from "@stream-io/video-react-sdk";
import Image from "next/image";
import { useLivestreamStore } from "@/contexts/livestream-context";
import { LucidePin, LucideSend } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect } from "react";
import toast from "react-hot-toast";
import StreamStats from "../sub_components/stream-stats";
import { AuthUserProps } from "@/types/user";
import swal from "sweetalert";
import { useRouter } from "next/navigation";
import { streamDataProps } from "@/types/components";
import axiosInstance from "@/utils/axios";
import { getToken } from "@/utils/cookie.get";

const StreamDeckCamera = ({
  thisUser,
  streamData,
}: {
  thisUser: AuthUserProps | null;
  streamData: streamDataProps;
}) => {
  const {
    useCameraState,
    useMicrophoneState,
    useParticipantCount,
    useIsCallLive,
    useParticipants,
    useLocalParticipant,
    useCallEgress,
  } = useCallStateHooks();
  const call = useCall();
  const { camera: cam, isEnabled: isCamEnabled, devices } = useCameraState();
  const { microphone: mic, isEnabled: isMicEnabled } = useMicrophoneState();
  const participantCount = useParticipantCount();
  const me = useLocalParticipant();
  const isLive = useIsCallLive();
  const [_, ...participants] = useParticipants();
  const token = getToken();
  const router = useRouter();
  const egress = useCallEgress();

  useEffect(() => {
    if (isLive) {
      console.log(egress);
    }
  }, [isLive]);

  const handleLiveStreamEnd = () => {
    const endStream = async () => {
      if (isLive && streamData.user_id === thisUser?.user_id) {
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
            call?.stopLive();
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
                  call?.goLive();
                }
              })
              .catch((err) => {
                console.log(err);
                toast.error("You are not authorized to go live");
              });
            toast.success("Stream has ended");
            router.push("/profile");
          } else {
            call?.leave();
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
            call?.leave();
            router.push("/");
          }
        });
      }
    };
    endStream();
  };
  const toggleMic = async () => {
    if (isMicEnabled) {
      await mic.disable();
      toast.success("Microphone is muted");
    } else {
      await mic.enable();
      toast.success("Microphone is unmuted");
    }
  };

  const toggleCamera = async () => {
    if (isCamEnabled) {
      await cam.disable();
      toast.success("Camera is disabled");
    } else {
      await cam.enable();
      toast.success("Camera is enabled");
    }
  };

  const handleCameraChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedDeviceId = e.target.value;
    await cam.select(selectedDeviceId);
    toast.success("Camera changed");
  };

  const handleCreateStream = async () => {
    if (streamData.user_id === thisUser?.user_id && !isLive) {
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
            call?.goLive({
              start_recording: true,
              start_hls: true,
            });
            toast.success("You are now live");
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("You are not authorized to go live");
        });
    } else if (isLive) {
      call?.join();
    } else {
      toast.error("You are not authorized to go live");
    }
  };

  return (
    <div className="fixed bg-white dark:bg-gray-950 flex flex-col left-0 top-0 w-full min-h-screen items-center z-50">
      <div className="flex-1 w-full h-full border dark:border-slate-800 grid lg:grid-cols-3  dark:text-white relative">
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
        <div className="border h-full w-full dark:border-slate-800 relative flex flex-col">
          <div
            className={`h-full gap-2 w-full`}
            style={{
              flex: "1",
              display: "grid",
              gridTemplateColumns: "1fr",
              gridTemplateRows: "1fr",
            }}
          >
            {me && (
              <ParticipantView
                participant={me}
                ParticipantViewUI={null}
                className="overflow-hidden h-full"
              />
            )}
            {/* {participants.map((participant) => (
                                   <div className="h-full row-span-1 w-full object-cover" key={participant.userId}>
                                        <ParticipantView participant={participant} />
                                   </div>
                              ))} */}
          </div>
        </div>
        <div className="border h-full dark:border-slate-800 lg:relative lg:block absolute top-0 left-0 w-full">
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
              <div key={index} className="p-2 md:p-3 flex items-center gap-4">
                <Image
                  src={imgSrc}
                  alt="User"
                  width={60}
                  height={60}
                  className="h-12 w-12 rounded-full object-cover border-primary-dark-pink border"
                />
                <div>
                  <span className="text-xs font-bold block dark:text-white">
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
                  className="p-3 text-xs border dark:border-white w-full lg:border-gray-600 border-white rounded-md font-medium flex-1 bg-transparent text-white lg:text-black outline-none"
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
