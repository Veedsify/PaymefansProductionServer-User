import type { Story } from "@/types/Components";
import CaptionElement from "../CaptionElement";

type CaptionOverlayProps = {
  story: Story;
};

const CaptionOverlay = ({ story }: CaptionOverlayProps) => {
  const parsedCaptionElements = JSON.parse(story.captionElements);
  if (!parsedCaptionElements || parsedCaptionElements.length === 0) {
    return null;
  }
  return (
    <div className="absolute inset-0 w-full z-[100] h-full">
      {parsedCaptionElements.map((element: any) => (
        <CaptionElement key={element.id} element={element} />
      ))}
    </div>
  );
};

export default CaptionOverlay;
