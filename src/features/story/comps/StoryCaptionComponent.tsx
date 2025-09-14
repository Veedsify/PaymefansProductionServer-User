import Image from "next/image";
import {
  FileSignature,
  LucideSend,
  Text,
  Link,
  Move,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronLeft,
  ChevronRight,
  Palette,
  Bold,
  Italic,
} from "lucide-react";
import { StoryCaptionComponentProps } from "@/types/Components";
import { useState, useRef, useEffect, useCallback } from "react";
import SubmitUserStory from "@/utils/story/submit-user-story";
import toast from "react-hot-toast";
import { StoryType, useStoryStore } from "@/contexts/StoryContext";
import { fontFamilies } from "@/lib/FontFamilies";
import HlsViewer from "@/features/media/HlsViewer";

// Enhanced types for captions and links
interface CaptionElement {
  id: string;
  type: "text" | "link";
  content: string;
  url?: string;
  position: { x: number; y: number };
  style: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    color: string;
    textAlign: "left" | "center" | "right";
    textDecoration?: string;
    fontStyle?: string;
  };
}

interface EnhancedStoryType extends StoryType {
  captionElements?: CaptionElement[];
}

// Custom Swiper Component
const CustomSwiper = ({
  children,
  onSlideChange,
  initialSlide = 0,
}: {
  children: React.ReactNode[];
  onSlideChange?: (index: number) => void;
  initialSlide?: number;
}) => {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const swiperRef = useRef<HTMLDivElement>(null);
  const { setEditingSlide } = useStoryStore();
  const totalSlides = children.length;
  const minSwipeDistance = 50;

  const slideChange = useCallback(
    (newIndex: number) => {
      setEditingSlide(newIndex);
    },
    [setEditingSlide]
  );

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides || isTransitioning) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      onSlideChange?.(index);
      slideChange(index);
      setTimeout(() => setIsTransitioning(false), 300);
    },
    [totalSlides, isTransitioning, onSlideChange, slideChange]
  );

  const nextSlide = useCallback(
    () => goToSlide(currentSlide + 1),
    [goToSlide, currentSlide]
  );
  const prevSlide = useCallback(
    () => goToSlide(currentSlide - 1),
    [goToSlide, currentSlide]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, nextSlide, prevSlide]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black shadow-2xl rounded-xl">
      {/* Slides Container */}
      <div
        ref={swiperRef}
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children.map((child, index) => (
          <div key={index} className="h-full min-w-full">
            {child}
          </div>
        ))}
      </div>
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="absolute z-50 p-3 text-white border rounded-full left-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/50 transition-all duration-200 border-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="absolute z-50 p-3 text-white border rounded-full right-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/50 transition-all duration-200 border-white/10"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      {totalSlides > 1 && (
        <div className="absolute z-50 flex bottom-6 left-1/2 -translate-x-1/2 gap-2">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
      <div className="absolute z-50 px-3 py-1 text-sm font-medium text-white border rounded-full bottom-6 right-6 bg-black/30 backdrop-blur-sm border-white/10">
        {currentSlide + 1} / {totalSlides}
      </div>
    </div>
  );
};

const colorPalette = [
  "#ffffff",
  "#000000",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#ffa500",
  "#800080",
  "#ffc0cb",
  "#a52a2a",
  "#808080",
  "#ffd700",
  "#ff69b4",
];

const DraggableElement = ({
  element,
  onPositionChange,
  onContentChange,
  onSelect,
  isSelected,
  onDelete,
  onStyleChange,
  containerRef,
}: {
  element: CaptionElement;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onDelete: (id: string) => void;
  onStyleChange: (id: string, style: Partial<CaptionElement["style"]>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Start drag or tap
  const handleStart = (clientX: number, clientY: number, isTouch = false) => {
    setDragStart({ x: clientX, y: clientY });
    setInitialPosition(element.position);
    setDragMoved(false);
    onSelect(element.id);
    setIsDragging(true);
  };

  // Move drag
  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;
      const moved = Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2;
      setDragMoved(moved);
      if (!moved) return;
      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;
      const newX = Math.max(5, Math.min(95, initialPosition.x + deltaXPercent));
      const newY = Math.max(5, Math.min(95, initialPosition.y + deltaYPercent));
      onPositionChange(element.id, { x: newX, y: newY });
    },
    [
      isDragging,
      containerRef,
      dragStart.x,
      dragStart.y,
      initialPosition.x,
      initialPosition.y,
      onPositionChange,
      element.id,
    ]
  );

  // End drag or tap
  const handleEnd = useCallback(() => {
    setIsDragging(false);
    if (!dragMoved) {
      setIsEditing(true);
      onSelect(element.id);
    }
    setDragMoved(false);
  }, [dragMoved, onSelect, element.id]);

  // Mouse/touch handlers
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();
    document.addEventListener("mousemove", handleMouseMove);
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
    dragStart,
    initialPosition,
    dragMoved,
    handleEnd,
    handleMove,
  ]);

  // Main render
  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-blue-400 ring-opacity-70 scale-105 shadow-lg"
          : "hover:shadow-md"
      } ${isDragging ? "z-50 scale-110" : "z-30"}`}
      style={{
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        transform: "translate(-50%, -50%)",
        maxWidth: "80%",
        minWidth: "100px",
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onTouchStart={(e) =>
        handleStart(e.touches[0].clientX, e.touches[0].clientY, true)
      }
      // No onClick here; tap/click-to-edit handled in drag end logic
    >
      {isSelected && (
        <div className="absolute flex items-center -top-10 left-1/2 transform -translate-x-1/2 gap-1">
          <div className="bg-blue-500/80 rounded-full p-1.5 backdrop-blur-sm border border-white/20">
            <Move stroke="#fff" size={14} />
          </div>
        </div>
      )}
      {element.type === "text" ? (
        <textarea
          maxLength={100}
          onChange={(e) => onContentChange(element.id, e.target.value)}
          value={element.content}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          style={{
            fontSize: element.style.fontSize,
            fontWeight: element.style.fontWeight,
            color: element.style.color,
            textAlign: element.style.textAlign,
            fontStyle: element.style.fontStyle,
            textDecoration: element.style.textDecoration,
            pointerEvents: isSelected ? "auto" : "none",
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
            background: "transparent",
          }}
          className={`bg-transparent border-none outline-none resize-none text-center w-full min-h-[2em] ${
            element.style.fontFamily
          } ${isEditing ? "cursor-text" : "cursor-move"}`}
          placeholder="Enter text..."
        />
      ) : (
        <div className="flex flex-col items-center gap-1">
          <input
            type="text"
            onChange={(e) => onContentChange(element.id, e.target.value)}
            value={element.content}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            style={{
              fontSize: element.style.fontSize,
              fontWeight: element.style.fontWeight,
              color: element.style.color,
              textAlign: element.style.textAlign,
              fontStyle: element.style.fontStyle,
              textDecoration: element.style.textDecoration,
              pointerEvents: isSelected ? "auto" : "none",
              textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
              background: "transparent",
            }}
            className={`bg-transparent border-none outline-none text-center w-full min-w-[100px] ${
              element.style.fontFamily
            } ${isEditing ? "cursor-text" : "cursor-move"}`}
            placeholder="Link text"
          />
          <div className="text-xs text-white/90 max-w-[200px] truncate bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20">
            {element.url}
          </div>
        </div>
      )}
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

const EnhancedSlideComponent = ({
  story,
  close,
  index,
}: {
  story: EnhancedStoryType;
  index: number;
  close: () => void;
}) => {
  const { updateStorySlide, story: mystory, clearStory } = useStoryStore();
  const [fontIndex, setFontIndex] = useState(0);
  // Remove local captionElements state - use store directly
  const captionElements = story.captionElements || [];
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempLinkUrl, setTempLinkUrl] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper function to update caption elements in store
  const updateCaptionElements = (newElements: CaptionElement[]) => {
    updateStorySlide(index, { captionElements: newElements });
  };

  const changeFont = () => {
    const nextFont = fontFamilies[fontIndex];
    setFontIndex((fontIndex + 1) % fontFamilies.length);
    if (selectedElement) {
      updateElementStyle(selectedElement, { fontFamily: nextFont });
    }
  };

  const addTextElement = () => {
    const newElement: CaptionElement = {
      id: Date.now().toString(),
      type: "text",
      content: "Tap to edit",
      position: { x: 50, y: 50 },
      style: {
        fontFamily: fontFamilies[fontIndex],
        fontSize: "1.875rem",
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
      },
    };
    const newElements = [...captionElements, newElement];
    updateCaptionElements(newElements);
    setSelectedElement(newElement.id);
  };

  const addLinkElement = () => {
    setShowLinkDialog(true);
  };

  const createLink = () => {
    if (!tempLinkUrl) return;
    const newElement: CaptionElement = {
      id: Date.now().toString(),
      type: "link",
      content: "Link Text",
      url: tempLinkUrl,
      position: { x: 50, y: 30 },
      style: {
        fontFamily: fontFamilies[fontIndex],
        fontSize: "1.5rem",
        fontWeight: "bold",
        color: "#3b82f6",
        textAlign: "center",
      },
    };
    const newElements = [...captionElements, newElement];
    updateCaptionElements(newElements);
    setSelectedElement(newElement.id);
    setShowLinkDialog(false);
    setTempLinkUrl("");
  };

  const updateElementContent = (id: string, content: string) => {
    const newElements = captionElements.map((el) =>
      el.id === id ? { ...el, content } : el
    );
    updateCaptionElements(newElements);
  };

  const updateElementPosition = (
    id: string,
    position: { x: number; y: number }
  ) => {
    const newElements = captionElements.map((el) =>
      el.id === id ? { ...el, position } : el
    );
    updateCaptionElements(newElements);
  };

  const updateElementStyle = (
    id: string,
    styleUpdate: Partial<CaptionElement["style"]>
  ) => {
    const newElements = captionElements.map((el) =>
      el.id === id ? { ...el, style: { ...el.style, ...styleUpdate } } : el
    );
    updateCaptionElements(newElements);
  };

  const deleteElement = (id: string) => {
    const newElements = captionElements.filter((el) => el.id !== id);
    updateCaptionElements(newElements);
    setSelectedElement(null);
  };

  // Helper to get video durations and embed in mystory
  const getStoriesWithDurations = async () => {
    const videoStories = mystory.filter(
      (s) => s.media_type === "video" && s.media_url
    );
    const durations: Record<string, number> = {};
    await Promise.all(
      videoStories.map(
        (video) =>
          new Promise<void>((resolve) => {
            const videoEl = document.createElement("video");
            videoEl.src = video.media_url;
            videoEl.preload = "metadata";
            videoEl.onloadedmetadata = () => {
              durations[video.media_url] = videoEl.duration;
              resolve();
            };
            videoEl.onerror = () => resolve();
          })
      )
    );
    // Embed duration in each story object
    return mystory.map((story) =>
      story.media_type === "video" && story.media_url
        ? { ...story, duration: durations[story.media_url] || 0 }
        : { ...story, duration: 5 }
    );
  };

  const submitStory = async () => {
    const storiesWithDurations = await getStoriesWithDurations();
    const submit = await SubmitUserStory(storiesWithDurations);
    if (submit.success) {
      toast.success("Story uploaded successfully");
      close();
      clearStory();
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
      setShowColorPicker(false);
    }
  };

  const selectedElementData = selectedElement
    ? captionElements.find((el) => el.id === selectedElement)
    : null;

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <div className="absolute top-0 left-0 z-50 flex items-center justify-between w-full px-4 py-3 border-b backdrop-blur-md bg-white/10 border-white/20">
        <div className="flex items-center gap-2">
          <button
            onClick={changeFont}
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
            title="Change Font"
          >
            <FileSignature stroke="#fff" size={18} />
          </button>
          <button
            onClick={addTextElement}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 cursor-pointer hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            title="Add Text"
          >
            <Text stroke="#fff" size={18} />
          </button>
          <button
            onClick={addLinkElement}
            className="p-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 cursor-pointer hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
            title="Add Link"
          >
            <Link stroke="#fff" size={18} />
          </button>
        </div>
        <button
          onClick={submitStory}
          className="p-3 cursor-pointer rounded-xl bg-primary-dark-pink transition-all duration-200 transform hover:scale-105"
          title="Submit Story"
        >
          <LucideSend stroke="#fff" size={20} />
        </button>
      </div>
      {selectedElement && selectedElementData && (
        <div className="absolute z-40 p-4 border shadow-2xl top-20 left-4 right-4 backdrop-blur-md bg-white rounded-2xl border-white/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-lg gap-1 bg-white/10">
                <button
                  onClick={() =>
                    updateElementStyle(selectedElement, { textAlign: "left" })
                  }
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    selectedElementData.style.textAlign === "left"
                      ? "bg-white/30 text-black"
                      : "hover:bg-black/20 text-black/70"
                  }`}
                  title="Align Left"
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    updateElementStyle(selectedElement, { textAlign: "center" })
                  }
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    selectedElementData.style.textAlign === "center"
                      ? "bg-black/30 text-black"
                      : "hover:bg-black/20 text-black/70"
                  }`}
                  title="Align Center"
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  onClick={() =>
                    updateElementStyle(selectedElement, { textAlign: "right" })
                  }
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    selectedElementData.style.textAlign === "right"
                      ? "bg-black/30 text-black"
                      : "hover:bg-black/20 text-black/70"
                  }`}
                  title="Align Right"
                >
                  <AlignRight size={16} />
                </button>
              </div>
              <div className="flex items-center p-1 rounded-lg gap-1 bg-black/10">
                <button
                  onClick={() =>
                    updateElementStyle(selectedElement, {
                      fontWeight:
                        selectedElementData.style.fontWeight === "bold"
                          ? "normal"
                          : "bold",
                    })
                  }
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    selectedElementData.style.fontWeight === "bold"
                      ? "bg-white/30 text-black"
                      : "hover:bg-white/20 text-black/70"
                  }`}
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() =>
                    updateElementStyle(selectedElement, {
                      fontStyle:
                        selectedElementData.style.fontStyle === "italic"
                          ? "normal"
                          : "italic",
                    })
                  }
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    selectedElementData.style.fontStyle === "italic"
                      ? "bg-white/30 text-black"
                      : "hover:bg-white/20 text-black/70"
                  }`}
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
              </div>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 text-black rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
                title="Change Color"
              >
                <Palette size={16} />
              </button>
            </div>
            <div className="text-sm font-medium text-black/80">
              Tap to edit • Drag to move
            </div>
          </div>
          {showColorPicker && (
            <div className="p-3 mt-4 rounded-lg grid grid-cols-5 gap-2 bg-white/10">
              {colorPalette.map((color, index) => (
                <button
                  key={index}
                  onClick={() => {
                    updateElementStyle(selectedElement, { color });
                    setShowColorPicker(false);
                  }}
                  className="w-8 h-8 border-2 rounded-full border-white/30 hover:border-white/60 transition-all duration-200 hover:scale-110"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <div
        ref={containerRef}
        className="relative w-full h-full"
        onClick={handleContainerClick}
      >
        {story?.media_type === "video" && (
          <HlsViewer
            streamUrl={story?.media_url}
            isOpen={true}
            showControls={true}
            muted={true}
            className="w-full h-full object-contain bg-black rounded-xl"
          />
        )}
        {story?.media_type === "image" && (
          <Image
            src={story?.media_url}
            alt={story?.caption ? story.caption : "status"}
            width={800}
            height={800}
            className="object-contain w-full h-full bg-black rounded-xl"
          />
        )}
        {containerRef.current &&
          captionElements.map((element) => (
            <DraggableElement
              key={element.id}
              element={element}
              onPositionChange={updateElementPosition}
              onContentChange={updateElementContent}
              onSelect={setSelectedElement}
              isSelected={selectedElement === element.id}
              onDelete={deleteElement}
              onStyleChange={updateElementStyle}
              containerRef={containerRef}
            />
          ))}
      </div>
      {showLinkDialog && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-60">
          <div className="w-full max-w-sm p-8 mx-4 border shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl border-white/20">
            <h3 className="mb-6 text-xl font-bold text-gray-800">Add Link</h3>
            <input
              type="url"
              placeholder="Enter URL (e.g., https://example.com)"
              value={tempLinkUrl}
              onChange={(e) => setTempLinkUrl(e.target.value)}
              className="w-full p-4 mb-6 text-gray-800 border-2 border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <div className="flex gap-3">
              <button
                onClick={createLink}
                disabled={!tempLinkUrl}
                className="flex-1 py-3 font-medium text-black shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 disabled:from-gray-300 disabled:to-gray-400 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:shadow-none transform hover:scale-105 disabled:transform-none"
              >
                Add Link
              </button>
              <button
                onClick={() => {
                  setShowLinkDialog(false);
                  setTempLinkUrl("");
                }}
                className="flex-1 py-3 font-medium text-black shadow-lg bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StoryCaptionComponent = ({ close }: StoryCaptionComponentProps) => {
  const { story } = useStoryStore();

  return (
    <div className="flex flex-col items-center fixed justify-center inset-0 w-full min-h-dvh bg-black/70 z-[200] select-none">
      <div
        className="flex items-center justify-center flex-1 w-full p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            close();
          }
        }}
      >
        <div className="max-w-[520px] w-full aspect-[9/16]">
          <CustomSwiper>
            {story?.map((story, index) => (
              <EnhancedSlideComponent
                key={index}
                story={story}
                index={index}
                close={close}
              />
            ))}
          </CustomSwiper>
        </div>
      </div>
    </div>
  );
};

export default StoryCaptionComponent;
