import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Minus,
  Palette,
  Plus,
} from "lucide-react";
import { colorPalette, type CaptionElement } from "../types/caption.types";

interface ControlsToolbarProps {
  selectedElement: string | null;
  selectedElementData: CaptionElement | null;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  onStyleChange: (id: string, style: Partial<CaptionElement["style"]>) => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
}

export const ControlsToolbar = ({
  selectedElement,
  selectedElementData,
  showColorPicker,
  setShowColorPicker,
  onStyleChange,
  onIncreaseFontSize,
  onDecreaseFontSize,
}: ControlsToolbarProps) => {
  if (!selectedElement || !selectedElementData) return null;

  return (
    <div className="absolute top-20 left-4 right-4 z-[110] p-4 border shadow-2xl backdrop-blur-md bg-white rounded-2xl border-white/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg gap-1 bg-white/10">
            <button
              onClick={() =>
                onStyleChange(selectedElement, { textAlign: "left" })
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
                onStyleChange(selectedElement, { textAlign: "center" })
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
                onStyleChange(selectedElement, { textAlign: "right" })
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
                onStyleChange(selectedElement, {
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
                onStyleChange(selectedElement, {
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
              onClick={onDecreaseFontSize}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-white/20 text-black/70"
              title="Decrease Font Size"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={onIncreaseFontSize}
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
                onStyleChange(selectedElement, { color });
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
  );
};
