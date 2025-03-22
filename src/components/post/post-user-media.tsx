"use client"
import { useNewPostStore } from "@/contexts/new-post-context";
import { imageTypes, videoTypes } from "@/lib/filetypes";
import { X } from "lucide-react";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import NewPostMediaAdd from "../sub_components/sub/new-post-media-add";
import { UserMediaProps } from "@/types/components";

function PostUserMedia({
     medias,
     removedId
}: {
     medias?: UserMediaProps[] | null;
     removedId: Dispatch<SetStateAction<number[]>>
}) {
     const [media, setMedia] = React.useState<UserMediaProps[] | null>(null)

     useEffect(() => {
          if (medias) {
               setMedia(medias)
          }
     }, [medias])

     const removeThisMedia = (index: number) => {
          if (media) {
               const files = media.filter((_, i) => i !== index)
               removedId(prev => {
                    if (media[index].id) {
                         return [...prev, media[index].id]
                    }
                    return prev
               })
               setMedia(files)
          }
     }

     return (
          <>
               <div className="md:px-8 px-4 mb-5">
                    <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 items-center gap-3 overflow-x-auto select-none">
                         {media?.map((file, index) =>
                              <div className="relative" key={index}>
                                   <Media file={file} index={index} removeThisMedia={removeThisMedia} />
                              </div>
                         )}
                    </div>
               </div>
          </>
     );
}

const Media = ({ file, removeThisMedia, index }: {
     file: UserMediaProps,
     index: number,
     removeThisMedia: (index: number) => void
}) => {
     return (
          <>
               {file.media_type.includes("video") && (
                    <video src={file.url || "/site/loading.gif"} className="object-cover h-auto aspect-square shadow-lg border block rounded-xl" />
               )}
               {file.media_type.includes("image") && (
                    <Image src={file.url || "/site/loading.gif"}
                         unoptimized
                         alt="1" width={200} height={200} className="object-cover h-auto aspect-square shadow-lg border block rounded-xl" />
               )}
               <div className="absolute top-0 right-0 bg-black/50 text-white p-1 w-full h-full rounded-xl flex items-center justify-center">
                    <span onClick={() => removeThisMedia(index)} className="cursor-pointer">
                         <X size={20} />
                    </span>
               </div >
          </>
     )
}
export default PostUserMedia;
