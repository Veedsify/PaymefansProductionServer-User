import { LucideScaling, Move, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CaptionElement } from "../types/caption.types";

interface DraggableElementProps {
  element: CaptionElement;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onDelete: (id: string) => void;
  onStyleChange: (id: string, style: Partial<CaptionElement["style"]>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const DraggableElement = ({
  element,
  onPositionChange,
  onContentChange,
  onSelect,
  isSelected,
  onDelete,
  onStyleChange,
  containerRef,
}: DraggableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 50, y: 50 });
  const [initialFontSize, setInitialFontSize] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Start drag or tap
  const handleStart = (
    clientX: number,
    clientY: number,
    isTouch = false,
    isScaleMode = false
  ) => {
    setDragStart({ x: clientX, y: clientY });
    setInitialPosition(element.position);
    setDragMoved(false);
    onSelect(element.id);

    if (isScaleMode) {
      setIsScaling(true);
      const currentSize = parseFloat(element.style.fontSize);
      setInitialFontSize(currentSize);
    } else {
      setIsDragging(true);
    }
  };

  // Move drag or scale
  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if ((!isDragging && !isScaling) || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;

      const moved = Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2;
      setDragMoved(moved);

      if (!moved) return;

      if (isScaling) {
        // Scale based on vertical drag distance
        const scaleDistance = -deltaY; // Negative because dragging up should increase size
        const scaleFactor = scaleDistance / 100; // Adjust sensitivity
        const newSize = Math.max(
          0.75,
          Math.min(5, initialFontSize + scaleFactor)
        );
        onStyleChange(element.id, { fontSize: `${newSize}rem` });
      } else if (isDragging) {
        // Regular dragging
        const deltaXPercent = (deltaX / rect.width) * 100;
        const deltaYPercent = (deltaY / rect.height) * 100;

        const newX = Math.max(
          5,
          Math.min(95, initialPosition.x + deltaXPercent)
        );
        const newY = Math.max(
          5,
          Math.min(95, initialPosition.y + deltaYPercent)
        );

        onPositionChange(element.id, { x: newX, y: newY });
      }
    },
    [
      isDragging,
      isScaling,
      containerRef,
      dragStart.x,
      dragStart.y,
      initialPosition.x,
      initialPosition.y,
      initialFontSize,
      onPositionChange,
      onStyleChange,
      element.id,
    ]
  );

  // End drag or tap
  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setIsScaling(false);
    if (!dragMoved) {
      setIsEditing(true);
      onSelect(element.id);
    }
    setDragMoved(false);
  }, [dragMoved, onSelect, element.id]);

  // Mouse/touch handlers
  useEffect(() => {
    if (!isDragging && !isScaling) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isDragging,
    isScaling,
    dragStart,
    initialPosition,
    initialFontSize,
    dragMoved,
    handleEnd,
    handleMove,
  ]);

  // Main render
  return (
    <div
      ref={elementRef}
      className={`absolute select-none  ${
        isSelected
          ? "ring-1 ring-primary-dark-pink ring-opacity-70 scale-105 shadow-lg"
          : "hover:shadow-md"
      } ${isDragging || isScaling ? "z-[70]" : "z-[55]"}`}
      style={{
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        transform: "translate(-50%, -50%)",
        maxWidth: "320px",
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {isSelected && (
        <div className="absolute flex items-center -top-12 left-1/2 transform -translate-x-1/2 gap-2">
          <div
            className="bg-blue-500/80 rounded-full p-2 backdrop-blur-sm border border-white/20 cursor-grab active:cursor-grabbing hover:bg-blue-600/80 transition-colors"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleStart(e.clientX, e.clientY);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleStart(e.touches[0].clientX, e.touches[0].clientY, true);
            }}
            title="Drag to move"
          >
            <Move stroke="#fff" size={16} />
          </div>
          <div
            className="bg-white/80 rounded-full p-2 backdrop-blur-sm border border-white/20 cursor-ns-resize hover:bg-white/80 transition-colors"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleStart(e.clientX, e.clientY, false, true);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleStart(
                e.touches[0].clientX,
                e.touches[0].clientY,
                true,
                true
              );
            }}
            title="Drag up/down to scale"
          >
            <LucideScaling stroke="#000" size={16} />
          </div>
        </div>
      )}
      <div className="w-full h-full flex items-center justify-center">
        {element.type === "text" ? (
          <textarea
            maxLength={100}
            onChange={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
              onContentChange(element.id, e.target.value);
            }}
            value={element.content}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(element.id);
              setIsEditing(true);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            style={{
              maxWidth: "320px",
              width: "fit-content",
              fontSize: element.style.fontSize,
              fontWeight: element.style.fontWeight,
              color: element.style.color,
              textAlign: element.style.textAlign,
              fontStyle: element.style.fontStyle,
              textDecoration: element.style.textDecoration,
              pointerEvents: "auto",
              textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
              background: "transparent",
            }}
            className={`bg-transparent placeholder:text-white/70 text-wrap border-none outline-none resize-none text-center  min-h-[2em] ${
              element.style.fontFamily
            } ${isEditing ? "cursor-text" : "cursor-pointer"}`}
            placeholder="Enter text..."
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <textarea
              onChange={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
                onContentChange(element.id, e.target.value);
              }}
              value={element.content}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(element.id);
                setIsEditing(true);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              style={{
                maxWidth: "320px",
                width: "fit-content",
                fontSize: element.style.fontSize,
                fontWeight: element.style.fontWeight,
                color: element.style.color,
                textAlign: element.style.textAlign,
                fontStyle: element.style.fontStyle,
                textDecoration: element.style.textDecoration,
                pointerEvents: "auto",
                textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                background: "transparent",
              }}
              className={`bg-transparent placeholder:text-white/70 border-none outline-none resize-none text-center h-fit w-[160px] ${
                element.style.fontFamily
              } ${isEditing ? "cursor-text" : "cursor-pointer"}`}
              placeholder="Link text"
            />
            <div className="text-xs text-white/90 max-w-[200px] truncate bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20">
              {element.url}
            </div>
          </div>
        )}
      </div>
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 hover:bg-red-600 transition-all duration-200 shadow-lg border border-white/20"
        >
          <X stroke="#fff" size={12} />
        </button>
      )}
    </div>
  );
};
