import dynamic from "next/dynamic";
import { useStoryStore } from "@/contexts/StoryContext";
import type { StoryCaptionComponentProps } from "@/types/Components";

// Dynamic imports for better code splitting
const CustomSwiper = dynamic(
  () => import("./CustomSwiper").then((mod) => ({ default: mod.CustomSwiper })),
  { ssr: false }
);

const EnhancedSlideComponent = dynamic(
  () =>
    import("./EnhancedSlideComponent").then((mod) => ({
      default: mod.EnhancedSlideComponent,
    })),
  { ssr: false }
);

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
