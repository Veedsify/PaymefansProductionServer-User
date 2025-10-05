import { AtSign, Link, LucideSend, Pen, X } from "lucide-react";

interface TopToolbarProps {
  onClearStory: () => void;
  onAddText: () => void;
  onAddLink: () => void;
  onOpenMention: () => void;
  onSubmitStory: () => void;
}

export const TopToolbar = ({
  onClearStory,
  onAddText,
  onAddLink,
  onOpenMention,
  onSubmitStory,
}: TopToolbarProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between w-full px-4 py-3 border-b  bg-black/80 border-white/20">
      <div className="flex items-center gap-2">
        <button
          onClick={onClearStory}
          className="p-2.5 rounded-xl bg-gradient-to-r bg-red-500 hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
          title="Clear Story"
        >
          <X stroke="#fff" size={18} />
        </button>
        <button
          onClick={onAddText}
          className="p-2.5 rounded-xl bg-gradient-to-r bg-white text-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          title="Add Text"
        >
          <Pen stroke="#000" size={18} />
        </button>
        <button
          onClick={onAddLink}
          className="p-2.5 rounded-xl bg-gradient-to-r bg-blue-500 transition-all duration-200 transform hover:scale-105"
          title="Add Link"
        >
          <Link stroke="#fff" size={18} />
        </button>
        <button
          onClick={onOpenMention}
          className="p-2.5 rounded-xl bg-emerald-500 transition-all duration-200 transform hover:scale-105"
          title="Tag Users"
        >
          <AtSign stroke="#fff" size={18} />
        </button>
      </div>
      <button
        onClick={onSubmitStory}
        className="p-2.5 cursor-pointer rounded-xl bg-primary-dark-pink transition-all duration-200 transform hover:scale-105"
        title="Submit Story"
      >
        <LucideSend stroke="#fff" size={20} />
      </button>
    </div>
  );
};
