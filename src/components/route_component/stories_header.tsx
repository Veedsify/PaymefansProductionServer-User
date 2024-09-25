import Image from "next/image";
import Link from "next/link";

const StoriesHeader = () => {
    return (
        <div className="bg-black bg-opacity-35 backdrop-blur-sm p-2">
            <div className="flex items-center gap-3">
                <Link href="/stories">
                    <Image
                        width={48}
                        height={48}
                        src="/images/login_image.png"
                        alt=""
                        className="h-12 w-12 rounded-full object-cover"
                    />
                </Link>
                <Link href="/stories">
                    <p className="text-white">crymson_tims</p>
                    <p className="text-xs text-white">
                        1h
                    </p>
                </Link>
            </div>
        </div>
    );
}

export default StoriesHeader;