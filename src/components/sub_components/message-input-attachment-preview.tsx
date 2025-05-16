import Image from "next/image";

type MessageInputAttachmentPreviewProps = {
  type: "image" | "video";
  previewUrl: string;
  posterUrl?: string;
};
const MessageInputAttachmentPreview = ({
  type,
  previewUrl,
  posterUrl,
}: MessageInputAttachmentPreviewProps) => {
  return (
    <>
      {type === "video" ? (
        <video
          src={previewUrl}
          muted
          className="w-full aspect-square rounded-xl cursor-pointer object-cover"
          poster={posterUrl}
        />
      ) : (
        <Image
          width={400}
          height={400}
          priority
          src={previewUrl}
          alt=""
          className="w-full aspect-square rounded-xl object-cover"
        />
      )}
    </>
  );
};

export default MessageInputAttachmentPreview;
