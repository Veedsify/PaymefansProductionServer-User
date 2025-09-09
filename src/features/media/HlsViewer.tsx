"use client";
import Hls from "hls.js";
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  memo,
} from "react";
import { useInView } from "react-intersection-observer";

interface VideoPlayerProps {
  streamUrl: string;
  muted?: boolean;
  className: string;
}

const HlsViewer = memo(({ streamUrl, className, muted }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const isMp4 = streamUrl.endsWith(".mp4");
  const { ref, inView } = useInView({ triggerOnce: false });
  const [shouldPlay, setShouldPlay] = useState(false);
  const [shouldMute, setShouldMute] = useState(true);

  useEffect(() => {
    setShouldPlay(inView);
    setShouldMute(!inView);
  }, [inView]);

  useLayoutEffect(() => {
    if (isMp4) return;
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    }
  }, [streamUrl, isMp4]);

  return (
    <div ref={ref} className={className}>
      {isMp4 ? (
        <video
          controlsList="nodownload noremoteplayback nofullscreen"
          className={className}
          muted={shouldMute && muted}
          autoPlay={shouldPlay}
          loop
          style={{ background: "#000000" }}
        >
          <source src={streamUrl} type="video/mp4" />
        </video>
      ) : (
        <video
          ref={videoRef}
          controlsList="nodownload noremoteplayback nofullscreen nopip noplaybackrate"
          className={className}
          autoPlay={shouldPlay}
          muted={shouldMute}
          loop
          style={{ background: "#000000" }}
        />
      )}
    </div>
  );
});

HlsViewer.displayName = "HlsViewer";

export default HlsViewer;
