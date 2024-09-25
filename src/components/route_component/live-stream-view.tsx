// import { ParticipantView, useCallStateHooks } from '@stream-io/video-react-sdk';
// import '@stream-io/video-react-sdk/dist/css/styles.css';
// // ... the rest of the code

// const LivestreamView = ({ call }: { call: any }) => {
//      const {
//           useCameraState,
//           useMicrophoneState,
//           useParticipantCount,
//           useIsCallLive,
//           useParticipants,
//      } = useCallStateHooks();

//      const { camera: cam, isEnabled: isCamEnabled } = useCameraState();
//      const { microphone: mic, isEnabled: isMicEnabled } = useMicrophoneState();

//      const participantCount = useParticipantCount();
//      const isLive = useIsCallLive();

//      const [firstParticipant] = useParticipants();

//      return (
//           <div className='w-full h-full'>
//                {/* <div>{isLive ? `Live: ${participantCount}` : `In Backstage`}</div> */}
//                {firstParticipant ? (
//                     <ParticipantView
//                     className='w-full h-full'
//                     participant={firstParticipant} />
//                ) : (
//                     <div>The host hasn't joined yet</div>
//                )}
//                {/* <div style={{ display: 'flex', gap: '4px' }}>
//                     <button onClick={() => (isLive ? call.stopLive() : call.goLive())}>
//                          {isLive ? "Stop Live" : "Go Live"}
//                     </button>
//                     <button onClick={() => cam.toggle()}>
//                          {isCamEnabled ? "Disable camera" : "Enable camera"}
//                     </button>
//                     <button onClick={() => mic.toggle()}>
//                          {isMicEnabled ? "Mute Mic" : "Unmute Mic"}
//                     </button>
//                </div> */}
//           </div>
//      );
// };

// export default LivestreamView;