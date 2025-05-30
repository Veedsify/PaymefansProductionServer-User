"use client";
import {
  LucideMessageCircle,
  LucidePercentDiamond,
  LucideUser,
} from "lucide-react";
import {
  LegacyRef,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";

const SupportHelp = () => {
  const [chatIsOpen, setChatIsOpen] = useState(false);
  const buttonRef: LegacyRef<HTMLButtonElement> = useRef(null);
  const chatRef: LegacyRef<HTMLDivElement> = useRef(null);

  const toggleChat = () => {
    setChatIsOpen(!chatIsOpen);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (buttonRef.current && chatRef.current) {
        if (
          !buttonRef.current.contains(event.target as Node) &&
          !chatRef.current.contains(event.target as Node)
        ) {
          setChatIsOpen(false);
        }
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className={""}>
      <button
        ref={buttonRef}
        onClick={toggleChat}
        className="absolute z-[200] bottom-16 right-4 inline-flex items-center justify-center text-sm font-medium animate-pulse disabled:pointer-events-none disabled:opacity-50  rounded-full w-16 h-16 bg-black hover:bg-gray-700 m-0 cursor-pointer bg-none p-0 normal-case leading-5 hover:text-gray-900"
        type="button"
        aria-haspopup="dialog"
        aria-expanded="false"
        data-state="closed"
      >
        <LucideMessageCircle stroke={"#fff"} size={25} />
      </button>

      <div
        style={{
          boxShadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)",
          display: chatIsOpen ? "block" : "none",
        }}
        ref={chatRef}
        className="absolute bottom-[calc(7rem+1.5rem)] right-0 mr-[5px] md:mr-4 bg-white p-6 rounded-lg border border-[#e5e7eb] w-[calc(100%-10px)] sm:w-[375px] md:w-[440px] h-[634px]"
      >
        <div className="flex flex-col space-y-1.5 pb-6">
          <h2 className="font-semibold text-lg tracking-tight">Chatbot</h2>
          <p className="text-sm text-[#6b7280] leading-3">
            Powered by Mendable and Vercel
          </p>
        </div>

        <div
          className="pr-4 h-[474px]"
          style={{ minWidth: "100%", display: "table" }}
        >
          <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
            <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
              <div className="rounded-full bg-gray-100 border p-1">
                <LucidePercentDiamond />
              </div>
            </span>
            <p className="leading-relaxed">
              <span className="block font-bold text-gray-700">AI </span>Hi, how
              can I help you today?
            </p>
          </div>

          <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
            <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
              <div className="rounded-full bg-gray-100 border p-1">
                <LucideUser />
              </div>
            </span>
            <p className="leading-relaxed">
              <span className="block font-bold text-gray-700">You </span>fewafef
            </p>
          </div>
          <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
            <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
              <div className="rounded-full bg-gray-100 border p-1">
                <LucidePercentDiamond />
              </div>
            </span>
            <p className="leading-relaxed">
              <span className="block font-bold text-gray-700">AI </span>Sorry, I
              couldn&apos;t find any information in the documentation about
              that. Expect answer to be less accurateI could not find the answer
              to this in the verified sources.
            </p>
          </div>
        </div>
        <div className="flex items-center pt-0">
          <form className="flex items-center justify-center w-full space-x-2 gap-2">
            <input
              className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-4 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
              placeholder="Type your message"
              defaultValue=""
            />
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-[#111827E6] h-10 px-4 py-4">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportHelp;
