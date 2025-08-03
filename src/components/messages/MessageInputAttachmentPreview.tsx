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
          className="object-cover w-full cursor-pointer aspect-square rounded-xl"
          poster={posterUrl}
        />
      ) : (
        <Image
          width={400}
          height={400}
          priority
          src={previewUrl}
          alt=""
          className="object-cover w-full aspect-square rounded-xl"
        />
      )}
    </>
  );
};

export default MessageInputAttachmentPreview;
