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
    textShadow: "0px 0px 10px rgba(0,0,0,0.5)", // Better readability on images/videos
    zIndex: 200,
    width: "100%",
  };

  return (
    <p
      style={elementStyle}
      onClick={handleClick}
      className={`
        text-wrap break-words leading-tight max-w-xs
        ${element.type === "link" ? "hover:opacity-80 transition-opacity" : ""}
        ${element.type === "link" ? "underline" : ""}
      `}
    >
      {element.content}
    </p>
  );
};

export default CaptionElement;
