"use client";
import { LucideMoreVertical } from "lucide-react";
import Link from "next/link";
import { MouseEvent, type RefObject, useEffect, useRef, useState } from "react";
import swal from "sweetalert";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { QuickPostActionsProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import QuickPostActionHooks from "@/utils/PostActions";

const QuickPostActions = ({ options }: QuickPostActionsProps) => {
  const [open, setOpen] = useState(false);
  const quickMenuRef = useRef(null) as unknown as RefObject<HTMLDivElement>;
  const { user } = useAuthContext();
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
        <ul className="py-1 overflow-hidden bg-white border rounded-lg shadow-2xl dark:bg-slate-800 dark:border-slate-700 border-black/30 w-52">
          {user?.username === options.username
            ? ownerOptions.map((option, index) => (
                <li
                  key={index}
                  className={`py-2 hover:bg-gray-50 dark:hover:bg-slate-900 ${index == ownerOptions.length - 1 ? "" : "border-b border-black/30 dark:border-slate-700"}`}
                >
                  {option?.func ? (
                    <>
                      <button
                        onClick={option?.func}
                        className="flex items-center w-full px-3 py-1 text-sm font-medium text-black cursor-pointer dark:text-white"
                      >
                        {option?.icon}
                        {option?.name}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={option?.link ? option?.link : "#"}
                        className="flex items-center px-3 py-1 text-sm font-medium text-black dark:text-white"
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
                  className={`py-2
                  ${index == publicOptions.length - 1 ? "" : "border-b border-black/30 dark:border-slate-700"}
                  hover:bg-gray-50 dark:hover:bg-slate-900`}
                >
                  {!option?.link ? (
                    <button
                      onClick={option?.func}
                      className="flex items-center w-full px-3 py-1 text-sm font-medium text-black cursor-pointer dark:text-white"
                    >
                      {option?.icon}
                      {option?.name}
                    </button>
                  ) : (
                    <Link
                      href={option?.link as string}
                      className="flex items-center px-3 py-1 text-sm font-medium text-black dark:text-white"
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
