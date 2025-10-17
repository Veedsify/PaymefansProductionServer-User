import { cn } from "@/components/ui/cn";
import { useMemo } from "react";

const CaptionElement = ({ element }: { element: any }) => {
  const handleClick = () => {
    if (element.type === "link" && element.url) {
      window.open(element.url, "_blank");
    }
  };

  const elementStyle = {
    position: "absolute" as const,
    left: `${element.position.x}%`,
    top: `${element.position.y}%`,
    fontFamily: "Geist Variable', sans-serif",
    fontSize: element.style.fontSize,
    fontWeight: element.style.fontWeight,
    color: element.style.color,
    textAlign: element.style.textAlign,
    fontStyle: element.style.fontStyle || "normal",
    transform: `translate(-${element.position.x}%, -50%) rotate(${360}deg)`,
    textDecoration: element.style.textDecoration || "none",
    cursor: element.type === "link" ? "pointer" : "default",
    userSelect: "none" as any,
    pointerEvents: (element.type === "link" ? "auto" : "none") as any,
    textShadow: "0px 0px 10px rgba(0,0,0,0.9)", // Better readability on images/videos
    overflowWrap: "break-word" as const,
    wordBreak: "break-word" as const,
    maxWidth: element.type !== "link" ? "320px" : "450px",
    zIndex: 200,
    width: "100%",
  };

  const text = useMemo(() => {
    if (element.type === "link") {
      const url = element.url || "";
      // Extract just the domain/hostname from the URL
      try {
        const urlObj = new URL(url);
        return `🔗 ${urlObj.hostname}...`;
      } catch {
        // Fallback for invalid URLs or relative URLs
        const match = url.match(/^https?:\/\/(?:www\.)?([^\/\?#]+)/);
        const domain = match ? match[1] : url.split(/[\/\?#]/)[0];
        return `🔗 ${domain}...`;
      }
    }
    return element.content;
  }, [element.url, element.content, element.type]);

  return (
    <p
      style={elementStyle}
      onClick={handleClick}
      className={cn(
        element.type === "link"
          ? "hover:opacity-80 transition-opacity bg-white/40 px-2 py-1 rounded-lg text-wrap"
          : " max-w-xs text-wrap wrap-break-word leading-tight"
      )}
    >
      {text}
    </p>
  );
};

export default CaptionElement;
