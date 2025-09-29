import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AtSign,
  Bold,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  Italic,
  Link,
  LucideScaling,
  LucideSend,
  Minus,
  Move,
  Palette,
  Pen,
  Plus,
  Text,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { type StoryType, useStoryStore } from "@/contexts/StoryContext";
import HlsViewer from "@/features/media/HlsViewer";
import { fontFamilies } from "@/lib/FontFamilies";
import type { StoryCaptionComponentProps } from "@/types/Components";
import SubmitUserStory from "@/utils/story/submit-user-story";
import FetchMentions from "@/utils/data/FetchMentions";
import { addStoryMentions } from "@/utils/data/FetchStoryMentions";
import FormatName from "@/lib/FormatName";
import swal from "sweetalert";

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
          <div key={index} className="h-full min-w-full relative">
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
              // type="text"
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
  // Get current story data from store to ensure reactivity
  const currentStory = mystory[index] || story;
  const captionElements = currentStory.captionElements || [];
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempLinkUrl, setTempLinkUrl] = useState("");
  const [showMentionDialog, setShowMentionDialog] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<
    { id: number; username: string; name: string }[]
  >(currentStory.mentions || []);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper function to update caption elements in store
  const updateCaptionElements = (newElements: CaptionElement[]) => {
    updateStorySlide(currentStory.media_id, { captionElements: newElements });
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
      content: "",
      position: { x: 50, y: 50 },
      style: {
        fontFamily: fontFamilies[fontIndex],
        fontSize: "1.5rem",
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
      position: { x: 50, y: 50 },
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

  // Mention functionality
  const searchUsers = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchedUsers([]);
      return;
    }

    setIsSearchingUsers(true);
    try {
      const users = await FetchMentions(query);
      setSearchedUsers(users);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchedUsers([]);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const addMention = (user: { id: number; username: string; name: string }) => {
    if (!selectedMentions.find((m) => m.id === user.id)) {
      const newMentions = [...selectedMentions, user];
      setSelectedMentions(newMentions);
      updateStorySlide(currentStory.media_id, { mentions: newMentions });
    }
    setMentionQuery("");
    setSearchedUsers([]);
  };

  const removeMention = (userId: number) => {
    const newMentions = selectedMentions.filter((m) => m.id !== userId);
    setSelectedMentions(newMentions);
    updateStorySlide(currentStory.media_id, { mentions: newMentions });
  };

  const openMentionDialog = () => {
    setShowMentionDialog(true);
  };

  // Handle mention search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mentionQuery) {
        searchUsers(mentionQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [mentionQuery]);

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

  const increaseFontSize = () => {
    if (!selectedElement) return;
    const element = captionElements.find((el) => el.id === selectedElement);
    if (!element) return;

    const currentSize = parseFloat(element.style.fontSize);
    const newSize = Math.min(currentSize + 0.25, 5); // Max 5rem
    updateElementStyle(selectedElement, { fontSize: `${newSize}rem` });
  };

  const decreaseFontSize = () => {
    if (!selectedElement) return;
    const element = captionElements.find((el) => el.id === selectedElement);
    if (!element) return;

    const currentSize = parseFloat(element.style.fontSize);
    const newSize = Math.max(currentSize - 0.25, 0.75); // Min 0.75rem
    updateElementStyle(selectedElement, { fontSize: `${newSize}rem` });
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

    if (submit.success && submit.data) {
      // Send mentions for each story that has them
      try {
        // Get the saved story data from the server response
        const savedStory = submit.data;
        const storyMediaList = savedStory.StoryMedia || [];

        // Create a map of client media_id to server media_id
        const mediaIdMap = new Map();
        storyMediaList.forEach((storyMedia: any) => {
          // Find the corresponding client story by media_id
          const clientStory = storiesWithDurations.find(
            (story) => story.media_id === storyMedia.media_id
          );
          if (clientStory) {
            // Map client media_id to server media_id (which is the same in this case)
            // but ensure we use the database ID for mentions
            mediaIdMap.set(clientStory.media_id, storyMedia.media_id);
          }
        });

        const mentionPromises = mystory
          .filter((story) => story.mentions && story.mentions.length > 0)
          .map(async (story) => {
            const serverMediaId = mediaIdMap.get(story.media_id);
            if (serverMediaId && story.mentions) {
              await addStoryMentions(
                serverMediaId,
                story.mentions.map((m) => m.id)
              );
            }
          });

        await Promise.all(mentionPromises);
      } catch (error) {
        console.error("Error sending story mentions:", error);
        // Don't fail the whole story upload if mentions fail
      }

      toast.success("Story uploaded successfully");
      close();
      clearStory();
    } else {
      toast.error(submit.message || "Failed to upload story");
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

  const handleClearStory = () => {
    swal({
      title: "Are you sure?",
      text: "This will clear your current story edits.",
      icon: "warning",
      buttons: ["Cancel", "Yes, cancel it!"],
      dangerMode: true,
    }).then((willClear) => {
      if (willClear) {
        clearStory();
        close();
        toast.success("Story cleared");
      }
    });
  };
  return (
    <div className="relative w-full max-h-dvh h-full flex items-center justify-center bg-black">
      {/* Top Toolbar - Separate Layer */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between w-full px-4 py-3 border-b  bg-black/80 border-white/20">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearStory}
            className="p-2.5 rounded-xl bg-gradient-to-r bg-red-500 hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
            title="Clear Story"
          >
            <X stroke="#fff" size={18} />
          </button>
          <button
            onClick={addTextElement}
            className="p-2.5 rounded-xl bg-gradient-to-r bg-white text-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            title="Add Text"
          >
            <Pen stroke="#000" size={18} />
          </button>
          <button
            onClick={addLinkElement}
            className="p-2.5 rounded-xl bg-gradient-to-r bg-blue-500 transition-all duration-200 transform hover:scale-105"
            title="Add Link"
          >
            <Link stroke="#fff" size={18} />
          </button>
          <button
            onClick={openMentionDialog}
            className="p-2.5 rounded-xl bg-emerald-500 transition-all duration-200 transform hover:scale-105"
            title="Tag Users"
          >
            <AtSign stroke="#fff" size={18} />
          </button>
        </div>
        <button
          onClick={submitStory}
          className="p-2.5 cursor-pointer rounded-xl bg-primary-dark-pink transition-all duration-200 transform hover:scale-105"
          title="Submit Story"
        >
          <LucideSend stroke="#fff" size={20} />
        </button>
      </div>

      {/* Controls Toolbar - Separate Layer */}
      {selectedElement && selectedElementData && (
        <div className="absolute top-20 left-4 right-4 z-[110] p-4 border shadow-2xl backdrop-blur-md bg-white rounded-2xl border-white/20">
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
              <div className="flex items-center p-1 rounded-lg gap-1 bg-black/10">
                <button
                  onClick={decreaseFontSize}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-white/20 text-black/70"
                  title="Decrease Font Size"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={increaseFontSize}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-white/20 text-black/70"
                  title="Increase Font Size"
                >
                  <Plus size={16} />
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
            <div className="absolute top-full left-0 right-0 z-[120] p-3 mt-2 rounded-lg grid grid-cols-5 gap-2 bg-white/95 backdrop-blur-md border border-white/20 shadow-xl">
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

      {/* Main Content Container */}
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <div
          ref={containerRef}
          className="relative w-full h-full flex"
          onClick={handleContainerClick}
        >
          {currentStory?.media_type === "video" && (
            <HlsViewer
              streamUrl={currentStory?.media_url}
              isOpen={true}
              showControls={true}
              muted={true}
              className="w-full h-full object-contain bg-black rounded-xl"
            />
          )}
          {currentStory?.media_type === "image" && (
            <Image
              src={currentStory?.media_url}
              alt={currentStory?.caption ? currentStory.caption : "status"}
              width={800}
              height={800}
              draggable={false}
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

        {/* Link Dialog */}
        {showLinkDialog && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[90] top-1/12">
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

        {/* Mention Dialog */}
        {showMentionDialog && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[90]">
            <div className="w-full max-w-md p-6 mx-4 border shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl border-white/20">
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                Tag Users
              </h3>

              {/* Selected Mentions */}
              {selectedMentions.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium text-gray-600">
                    Tagged Users:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentions.map((mention) => (
                      <div
                        key={mention.id}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full"
                      >
                        <span className="text-sm text-blue-800">
                          {mention.username}
                        </span>
                        <button
                          onClick={() => removeMention(mention.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search users to tag..."
                value={mentionQuery}
                onChange={(e) => setMentionQuery(e.target.value)}
                className="w-full p-3 mb-4 text-gray-800 border-2 border-gray-200 outline-none rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                autoFocus
              />

              {/* Search Results */}
              {mentionQuery && (
                <div className="mb-4">
                  {isSearchingUsers ? (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : searchedUsers.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                      {searchedUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => addMention(user)}
                          disabled={selectedMentions.some(
                            (m) => m.id === user.id
                          )}
                          className="flex items-center w-full gap-3 p-3 text-left transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                            {user.profile_image ? (
                              <Image
                                src={user.profile_image}
                                alt={user.username}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-600">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className=" text-gray-800">
                              {FormatName(user.name)}
                            </div>
                            <div className="font-medium text-sm text-gray-500">
                              {user.username}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMentionDialog(false);
                    setMentionQuery("");
                    setSearchedUsers([]);
                  }}
                  className="flex-1 py-3 font-medium text-white shadow-lg bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StoryCaptionComponent = ({ close }: StoryCaptionComponentProps) => {
  const { story } = useStoryStore();

  return (
    <div className="flex flex-col items-center fixed justify-center inset-0 w-full min-h-dvh bg-black/70 z-[200] select-none">
      <div
        className="flex items-center justify-center flex-1 w-full md:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            close();
          }
        }}
      >
        <div className="w-full md:max-w-[520px] h-full md:h-auto md:aspect-[9/16]">
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
