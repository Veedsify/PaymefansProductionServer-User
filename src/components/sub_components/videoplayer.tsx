
const VideoPlayer = ({ link, className }: { link: string | undefined, className?: string }) => {
    return (
        <video
            className={className}
            loop={true}
            src={link} ></video>
    );
}

export default VideoPlayer;