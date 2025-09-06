"use client";
import Hls from "hls.js";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

interface VideoPlayerProps {
  streamUrl: string;
  className: string;
}

const HlsViewer = ({ streamUrl, className }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (!ref) return;
    if (inView) {
      setShouldPlay(true);
      return;
    }
    setShouldPlay(false);
    return () => setShouldPlay(false);
  }, [inView, ref]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    }
  }, [streamUrl]);

  return (
    <div ref={ref} className={className}>
      <video
        ref={videoRef}
        controlsList="nodownload noremoteplayback nofullscreen nopip noplaybackrate"
        className={className}
        muted={true}
        loop={true}
        autoPlay={true}
        style={{ background: "#000000" }}
      ></video>
    </div>
  );
};

export default HlsViewer;
