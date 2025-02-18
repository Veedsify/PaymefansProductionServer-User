import Image from "next/image";
import Link from "next/link";

const GroupMessageComponent = () => {
  return (
    <div className="p-4 px-6 flex items-center hover:bg-gray-50 bg-opacity-70 gap-4 border-b cursor-pointer">
      <Link href={""}>
        <Image
          src={
            "https://images.pexels.com/photos/17814245/pexels-photo-17814245/free-photo-of-young-well-dressed-man-sitting-on-a-sofa-in-a-modern-interior.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
          }
          alt="message"
          width={100}
          height={100}
          className="aspect-square object-cover h-14 w-14 rounded-full inline-block"
        />
      </Link>
      <Link href={"/groups/1"} className="flex-1">
        <h3 className="font-semibold">Mike Morela</h3>
        <p className="text-xs">Hey this is nice though</p>
      </Link>
      <Link href={"/groups/1"} className="flex items-center gap-2">
        <p className="text-xs">19:33</p>
        <span className="text-white w-2 h-2 bg-primary-dark-pink rounded-2xl block"></span>
      </Link>
    </div>
  );
};

export default GroupMessageComponent;
