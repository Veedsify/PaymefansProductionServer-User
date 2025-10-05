import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { useQueryClient } from "@tanstack/react-query";
import { useStoryStore } from "@/contexts/StoryContext";
import HlsViewer from "@/features/media/HlsViewer";
import { fontFamilies } from "@/lib/FontFamilies";
import SubmitUserStory from "@/utils/story/submit-user-story";
import FetchMentions from "@/utils/data/FetchMentions";
import { addStoryMentions } from "@/utils/data/FetchStoryMentions";
import type { CaptionElement, EnhancedStoryType } from "../types/caption.types";
import { DraggableElement } from "./DraggableElement";
import { ControlsToolbar } from "./ControlsToolbar";
import { LinkDialog } from "./LinkDialog";
import { MentionDialog } from "./MentionDialog";
import { TopToolbar } from "./TopToolbar";

interface EnhancedSlideComponentProps {
  story: EnhancedStoryType;
  index: number;
  close: () => void;
}

export const EnhancedSlideComponent = ({
  story,
  close,
  index,
}: EnhancedSlideComponentProps) => {
  const { updateStorySlide, story: mystory, clearStory } = useStoryStore();
  const [fontIndex, setFontIndex] = useState(0);
  const queryClient = useQueryClient();
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
      try {
        const savedStory = submit.data;
        const storyMediaList = savedStory.StoryMedia || [];
        // Create a map of client media_id to server media_id
        const mediaIdMap = new Map();
        storyMediaList.forEach((storyMedia: any) => {
          const clientStory = storiesWithDurations.find(
            (story) => story.media_id === storyMedia.media_id
          );
          if (clientStory) {
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
      queryClient.invalidateQueries({ queryKey: ["personal-stories"] });
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
    ? captionElements.find((el) => el.id === selectedElement) || null
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

  const closeLinkDialog = () => {
    setShowLinkDialog(false);
    setTempLinkUrl("");
  };

  const closeMentionDialog = () => {
    setShowMentionDialog(false);
    setMentionQuery("");
    setSearchedUsers([]);
  };

  return (
    <div className="relative w-full max-h-dvh h-full flex items-center justify-center bg-black">
      {/* Top Toolbar */}
      <TopToolbar
        onClearStory={handleClearStory}
        onAddText={addTextElement}
        onAddLink={addLinkElement}
        onOpenMention={openMentionDialog}
        onSubmitStory={submitStory}
      />

      {/* Controls Toolbar */}
      <ControlsToolbar
        selectedElement={selectedElement}
        selectedElementData={selectedElementData}
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
        onStyleChange={updateElementStyle}
        onIncreaseFontSize={increaseFontSize}
        onDecreaseFontSize={decreaseFontSize}
      />

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
        <LinkDialog
          showLinkDialog={showLinkDialog}
          tempLinkUrl={tempLinkUrl}
          setTempLinkUrl={setTempLinkUrl}
          onCreateLink={createLink}
          onClose={closeLinkDialog}
        />

        {/* Mention Dialog */}
        <MentionDialog
          showMentionDialog={showMentionDialog}
          mentionQuery={mentionQuery}
          setMentionQuery={setMentionQuery}
          selectedMentions={selectedMentions}
          searchedUsers={searchedUsers}
          isSearchingUsers={isSearchingUsers}
          onAddMention={addMention}
          onRemoveMention={removeMention}
          onClose={closeMentionDialog}
        />
      </div>
    </div>
  );
};
