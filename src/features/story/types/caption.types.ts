import type { StoryType } from "@/contexts/StoryContext";

export interface CaptionElement {
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

export interface EnhancedStoryType extends StoryType {
  captionElements?: CaptionElement[];
}

export const colorPalette = [
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
