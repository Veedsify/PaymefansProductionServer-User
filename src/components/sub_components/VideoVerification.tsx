import Image from "next/image";

const VideoVerification = () => {
    return (
        <div>
            <label htmlFor="videos">
                <div className="flex items-center justify-center mb-3 bg-gray-200 cursor-pointer aspect-square rounded-xl">
                    <Image
                        width={40}
                        height={40}
                        priority
                        src="/site/verification_videos.png" alt="" className="block mx-auto mb-4 text-center" />
                </div>
                <p className="text-sm font-medium text-center">Upload 3 different photos of you</p>
            </label>
            <input type="file" multiple={true} accept="image/*" className="hidden" name="videos" id="videos" />
        </div>
    );
}

export default VideoVerification;