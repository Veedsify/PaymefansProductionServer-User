import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { MentionUser } from "@/types/Components";
import FetchMentions from "@/utils/data/FetchMentions";

interface MentionSuggestion extends MentionUser {
  highlighted?: boolean;
}

export const useMentions = () => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<
    MentionSuggestion[]
  >([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const [mentions, setMentions] = useState<MentionUser[]>([]);
  const [isMentionLoading, setIsMentionLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchUsers = useCallback(
    async (query: string): Promise<MentionUser[]> => {
      setIsMentionLoading(true);
      try {
        const filteredUsers = await FetchMentions(query);
        return filteredUsers;
      } catch (error) {
        return [];
      } finally {
        setIsMentionLoading(false);
      }
    },
    [],
  );

  // Debounced mention search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (mentionQuery.length > 0) {
      debounceRef.current = setTimeout(() => {
        searchUsers(mentionQuery).then((users) => {
          setMentionSuggestions(
            users.map((user, index) => ({ ...user, highlighted: index === 0 })),
          );
          setSelectedMentionIndex(0);
        });
      }, 300);
    } else {
      setMentionSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [mentionQuery, searchUsers]);

  const processMentions = useCallback((text: string, cursorPos: number) => {
    setCursorPosition(cursorPos);
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const hasSpaceAfterAt =
        textAfterAt.includes(" ") || textAfterAt.includes("\n");

      if (!hasSpaceAfterAt && textAfterAt.length <= 20) {
        setShowMentions(true);
        setMentionQuery(textAfterAt);
        setMentionStartPos(lastAtIndex);
      } else {
        setShowMentions(false);
        setMentionQuery("");
      }
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  }, []);

  const selectMention = useCallback(
    (
      mentionedUser: MentionUser,
      textareaRef: React.RefObject<HTMLTextAreaElement | null>,
    ) => {
      if (!textareaRef.current) return;

      if (mentions.find((m) => m.id === mentionedUser.id)) {
        toast.error(`@${mentionedUser.username} is already mentioned.`, {
          id: "mention-duplicate",
        });
        return;
      }

      const textarea = textareaRef.current;
      const currentText = textarea.value;
      const beforeMention = currentText.substring(0, mentionStartPos);
      const afterMention = currentText.substring(cursorPosition);
      const newText = `${beforeMention}@${mentionedUser.username} ${afterMention}`;
      const newCursorPos = mentionStartPos + mentionedUser.username.length + 2;

      textarea.value = newText;
      setMentions((prev) => [...prev, mentionedUser]);
      setShowMentions(false);
      setMentionQuery("");

      textarea.focus();
      setTimeout(() => {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }, 0);

      return newText;
    },
    [mentionStartPos, cursorPosition, mentions],
  );

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLTextAreaElement>,
      textareaRef: React.RefObject<HTMLTextAreaElement | null>,
    ) => {
      if (showMentions && mentionSuggestions.length > 0) {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setSelectedMentionIndex((prev) =>
              prev < mentionSuggestions.length - 1 ? prev + 1 : 0,
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setSelectedMentionIndex((prev) =>
              prev > 0 ? prev - 1 : mentionSuggestions.length - 1,
            );
            break;
          case "Enter":
          case "Tab": {
            e.preventDefault();
            const newText = selectMention(
              mentionSuggestions[selectedMentionIndex],
              textareaRef,
            );
            return newText;
          }
          case "Escape":
            setShowMentions(false);
            setMentionQuery("");
            break;
        }
      }
    },
    [showMentions, mentionSuggestions, selectedMentionIndex, selectMention],
  );

  const removeMention = useCallback((mentionId: string) => {
    setMentions((prev) => prev.filter((m) => m.id !== mentionId));
  }, []);

  return {
    showMentions,
    mentionQuery,
    mentionSuggestions,
    selectedMentionIndex,
    mentions,
    isMentionLoading,
    setSelectedMentionIndex,
    setMentions,
    processMentions,
    selectMention,
    removeMention,
    handleKeyDown,
  };
};
