import Image from "next/image";

const VideoVerification = () => {
    return (
        <div>
            <label htmlFor="videos">
                <div className="flex bg-gray-200 items-center justify-center aspect-square rounded-xl mb-3 cursor-pointer">
                    <Image
                        width={40}
                        height={40}
                        priority
                        src="/site/verification_videos.png" alt="" className="block text-center mx-auto mb-4" />
                </div>
                <p className="text-center text-sm font-medium">Upload 3 different photos of you</p>
            </label>
            <input type="file" multiple={true} accept="image/*" className="hidden" name="videos" id="videos" />
        </div>
    );
}

export default VideoVerification;