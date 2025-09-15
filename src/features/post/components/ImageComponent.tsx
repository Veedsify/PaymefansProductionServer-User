import { memo } from "react";
import Image from "next/image";
import { ImageCompProps } from "@/types/Components";

const ImageComponent = memo<ImageCompProps>(
  ({ media, data, clickImageEvent }) => (
    <Image
      src={media.url.trimEnd()}
      alt={data.post}
      width={900}
      height={900}
      unselectable="on"
      priority
      onClick={() => clickImageEvent(media)}
      className="w-full h-full rounded-lg aspect-[3/4] md:aspect-square object-cover cursor-pointer"
    />
  )
);

ImageComponent.displayName = "ImageComponent";
export default ImageComponent;
