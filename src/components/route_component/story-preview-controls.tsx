import {StoryPreviewControlProps} from "@/types/components";
import {useEffect, useRef} from "react";
import {useInView} from "react-intersection-observer";

const StoryPreviewControlls = ({
                                   moveToNextSlide,
                                   type,
                                   moveToPrevSlide,
                                   clickToPlay,
                                   playVideoOnLoad
                               }: StoryPreviewControlProps) => {

    const {ref, inView} = useInView({
        threshold: 1
    })
    useEffect(() => {
        if (inView && type === 'video') {
            playVideoOnLoad(true)
        }
    }, [inView]);

    return (
        <div className="flex absolute min-h-screen w-full z-50 inset-0">
            <div
                onClick={moveToPrevSlide}
                className="h-full w-full flex-[2] cursor-pointer">
                L
            </div>
            <div
                onClick={clickToPlay}
                ref={ref}
                className="h-full w-full flex-[3] cursor-pointer">
                C
            </div>
            <div
                onClick={moveToNextSlide}
                className="h-full w-full flex-[2] cursor-pointer">
                R
            </div>
        </div>
    );
}

export default StoryPreviewControlls;