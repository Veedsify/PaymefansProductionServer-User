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
    transform: "translate(-50%, -50%)",
    fontFamily: "Inter",
    fontSize: element.style.fontSize,
    fontWeight: element.style.fontWeight,
    color: element.style.color,
    textAlign: element.style.textAlign,
    fontStyle: element.style.fontStyle || "normal",
    textDecoration: element.style.textDecoration || "none",
    cursor: element.type === "link" ? "pointer" : "default",
    userSelect: "none" as any,
    pointerEvents: (element.type === "link" ? "auto" : "none") as any,
    textShadow: "1px 1px 2px rgba(0,0,0,0.8)", // Better readability on images/videos
    zIndex: 100,
    maxWidth: "80%",
    wordWrap: "break-word" as any,
  };

  return (
    <div
      style={elementStyle}
      onClick={handleClick}
      className={`
        ${element.type === "link" ? "hover:opacity-80 transition-opacity" : ""}
        ${element.type === "link" ? "underline" : ""}
      `}
    >
      {element.content}
    </div>
  );
};

export default CaptionElement;
