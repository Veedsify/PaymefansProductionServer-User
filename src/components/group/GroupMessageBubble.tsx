import { MoreHorizontal, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MouseEvent, useEffect, useRef, useState } from "react";

interface GroupMessageBubbleProps {
  isSender: boolean;
}

const GroupMessageBubble = ({ isSender = true }: GroupMessageBubbleProps) => {
  const [moreOptions, setMoreOptions] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = messageRef.current;

    const handleClick = (e: Event) => {
      if (ref && !ref.contains(e.target as Node)) {
        setMoreOptions(false);
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div
      ref={messageRef}
      className={`flex items-start gap-2.5 ${isSender ? "justify-end" : "justify-start"}`}
    >
      {!isSender && (
        <Image
          width={32}
          height={32}
          className="w-8 h-8 rounded-full"
          src="/images/verification.png"
          alt="Jese image"
        />
      )}
      <div
        className={`flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 ${isSender ? "bg-primary-dark-pink text-white rounded-tr-none" : "bg-gray-100 rounded-tl-none"} rounded-xl `}
      >
        <div className="flex items-center space-x-2 justify-between rtl:space-x-reverse">
          {!isSender && (
            <span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Bonnie Green
              </span>
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                11:46
              </span>
            </span>
          )}
          <button
            onClick={() => setMoreOptions(!moreOptions)}
            className="cursor-pointer text-sm font-medium text-center"
            type="button"
          >
            <MoreHorizontal size={12} />
          </button>
        </div>
        <p className="text-sm font-normal py-2.5">
          That's awesome. I think our users will really appreciate the
          improvements.
        </p>
      </div>

      {moreOptions && (
        <div
          className={`${isSender ? "-order-1" : ""} z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-700 dark:divide-gray-600`}
        >
          <ul
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownMenuIconButton"
          >
            <li>
              <Link
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Reply
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Forward
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Copy
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Report
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Delete
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default GroupMessageBubble;
