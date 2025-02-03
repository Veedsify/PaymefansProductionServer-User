"use client";
import {
  LucideEye,
  LucideEyeOff,
  LucideMoreVertical,
  LucidePen,
  LucideTrash,
} from "lucide-react";
import { MouseEvent, RefObject, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUserAuthContext } from "@/lib/userUseContext";
import swal from "sweetalert";
import axiosInstance from "@/utils/axios";
import { QuickPostActionsProps } from "@/types/components";
import QuickPostActionHooks from "@/utils/quick-actions-actions";

const QuickPostActions = ({ options }: QuickPostActionsProps) => {
  const [open, setOpen] = useState(false);
  const quickMenuRef = useRef(null) as RefObject<HTMLDivElement>;
  const { user } = useUserAuthContext();
  const { ownerOptions, publicOptions } = QuickPostActionHooks({ options });

  useEffect(() => {
    if (open) {
      const handleClickOutside = (event: any) => {
        if (
          quickMenuRef.current &&
          !quickMenuRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open, quickMenuRef]);

  return (
    <div
      className="relative"
      id="quick_menu"
      ref={quickMenuRef}
      onClick={(e) => e.stopPropagation()}
    >
      <span onClick={() => setOpen(true)}>
        <LucideMoreVertical className="cursor-pointer" size={20} />
      </span>
      <div
        className={`absolute right-0 py-3 z-20 duration-300 transition-all ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <ul className="bg-white dark:bg-slate-800 dark:border-slate-700 border shadow-2xl overflow-hidden rounded-lg w-52 py-1">
          {user?.username === options.username
            ? ownerOptions.map((option, index) => (
                <li
                  key={index}
                  className={`py-2 hover:bg-gray-50 dark:hover:bg-slate-900 ${index == ownerOptions.length - 1 ? "" : "border-b dark:border-slate-700"}`}
                >
                  {option?.func ? (
                    <>
                      <button
                        onClick={option?.func}
                        className="font-medium dark:text-white text-black flex items-center text-sm py-1 w-full px-3"
                      >
                        {option?.icon}
                        {option?.name}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={option?.link ? option?.link : "#"}
                        className="font-medium dark:text-white text-black flex items-center text-sm py-1 px-3"
                      >
                        {option?.icon}
                        {option?.name}
                      </Link>
                    </>
                  )}
                </li>
              ))
            : publicOptions.map((option, index) => (
                <li
                  key={index}
                  className="py-2 hover:bg-gray-50 dark:hover:bg-slate-900 border-b"
                >
                  {!option?.link ? (
                    <button
                      onClick={option?.func}
                      className="font-medium dark:text-white text-black flex items-center text-sm py-1 w-full px-3"
                    >
                      {option?.icon}
                      {option?.name}
                    </button>
                  ) : (
                    <Link
                      href={option?.link as string}
                      className="font-medium dark:text-white text-black flex items-center text-sm py-1 px-3"
                    >
                      {option?.icon}
                      {option?.name}
                    </Link>
                  )}
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
};

export default QuickPostActions;
