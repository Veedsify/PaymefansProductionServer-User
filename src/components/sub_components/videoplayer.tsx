import Hls from "hls.js";
import { HTMLProps, useEffect, useRef } from "react";

const HLSVideoPlayer = ({
  streamUrl,
  className,
  allOthers,
}: {
  streamUrl: string;
  className?: string;
  allOthers?: React.VideoHTMLAttributes<HTMLVideoElement>;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Check if Hls.js is supported in the browser
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded");
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
      });

      // Clean up the HLS instance when the component is unmounted
      return () => {
        hls.destroy();
      };
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // If HLS.js is not supported, use the browser's native support for HLS (Safari, for example)
      videoRef.current.src = streamUrl;
    }
  }, [streamUrl]);

  return <video {...allOthers} className={className} ref={videoRef}></video>;
};

export default HLSVideoPlayer;
