"use client";
import {
  LucideMessageCircle,
  LucideHeadphones,
  LucideUser,
  LucideSend,
  LucideLoader,
} from "lucide-react";
import { LegacyRef, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/UserUseContext";

const SupportHelp = () => {
  const [chatIsOpen, setChatIsOpen] = useState(false);
  const buttonRef: LegacyRef<HTMLButtonElement> = useRef(null);
  const chatRef: LegacyRef<HTMLDivElement> = useRef(null);
  const router = useRouter();
  const { user } = useAuthContext();

  const toggleChat = () => {
    setChatIsOpen(!chatIsOpen);
  };

  const handleStartSupport = () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push("/login");
      return;
    }
    // Navigate to full support chat page
    router.push("/help/support");
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
        className="absolute z-[200] bottom-16 right-4 inline-flex items-center justify-center text-sm font-medium animate-pulse disabled:pointer-events-none disabled:opacity-50 rounded-full w-16 h-16 bg-primary-dark-pink hover:bg-primary-dark-pink/90 m-0 cursor-pointer bg-none p-0 normal-case leading-5 shadow-lg hover:shadow-xl transition-all duration-300"
        type="button"
        aria-haspopup="dialog"
        aria-expanded="false"
        data-state="closed"
      >
        <LucideMessageCircle stroke={"#fff"} size={25} />
      </button>

      <div
        style={{
          boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
          display: chatIsOpen ? "block" : "none",
        }}
        ref={chatRef}
        className="absolute bottom-[calc(7rem+1.5rem)] right-0 mr-[5px] md:mr-4 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 w-[calc(100%-10px)] sm:w-[375px] md:w-[440px] h-[634px]"
      >
        <div className="flex flex-col space-y-1.5 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary-dark-pink/10">
              <LucideHeadphones size={20} className="text-primary-dark-pink" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                Support Chat
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-3">
                Get help from our support team
              </p>
            </div>
          </div>
        </div>

        <div
          className="pr-4 h-[474px] flex flex-col justify-center items-center text-center space-y-4"
          style={{ minWidth: "100%", display: "flex" }}
        >
          <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-700">
            <LucideHeadphones size={48} className="text-primary-dark-pink" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Need Help?
            </h3>
            <p className="max-w-xs text-sm text-gray-600 dark:text-gray-400">
              Connect with our support team for real-time assistance with your
              questions and issues.
            </p>
          </div>

          <div className="flex flex-col w-full gap-2">
            <button
              onClick={handleStartSupport}
              className="flex items-center justify-center w-full px-4 py-3 font-medium text-white rounded-lg bg-primary-dark-pink hover:bg-primary-dark-pink/90 transition-colors duration-200 gap-2"
            >
              <LucideMessageCircle size={18} />
              Start Support Chat
            </button>

            <button
              onClick={() => router.push("/help")}
              className="w-full px-4 py-3 font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition-colors duration-200"
            >
              Browse Help Articles
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>Average response time: 2-5 minutes</p>
            <p>Available 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportHelp;
