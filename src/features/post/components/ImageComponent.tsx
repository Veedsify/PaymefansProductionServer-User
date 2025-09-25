import Image from "next/image";
import { memo } from "react";
import type { ImageCompProps } from "@/types/Components";

const ImageComponent = memo<ImageCompProps>(
  ({ media, data, clickImageEvent }) => (
    <Image
      src={media.url.trimEnd()}
      alt={data.post}
      width={960}
      height={960}
      priority
      onClick={() => clickImageEvent(media)}
      className="w-full rounded-lg aspect-[3/4] md:aspect-square object-cover cursor-pointer"
    />
  )
);

ImageComponent.displayName = "ImageComponent";
export default ImageComponent;
