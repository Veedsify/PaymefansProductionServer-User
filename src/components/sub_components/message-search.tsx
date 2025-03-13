"use client"
import { LucideSearch, X } from "lucide-react";
import React, { useEffect, useState } from "react";

const MessageSearch = () => {
     const [openSearch, setOpenSearch] = useState(false);
     const handleOpenSearch = () => setOpenSearch(!openSearch);
     const inputRef = React.useRef<HTMLInputElement>(null);

     useEffect(() => {
          inputRef.current?.focus();
     }, [openSearch]);
     return (
          <div>
               <div className="flex align-baseline justify-between border  dark:text-white border-gray-400 rounded-md p-4 mb-7 w-full ">
                    <input onFocus={handleOpenSearch} type="text" placeholder="Search Messages" className=" text-sm outline-none border-none  dark:bg-gray-950 w-full" />
                    <LucideSearch className="block text-center" />
               </div>
               <div className={`fixed top-0 left-0 z-50 w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 rounded-md duration-300 transition-all ease-in-out ${openSearch ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                    <div className="absolute bottom-0 bg-white w-full flex justify-center p-2">
                         <button>
                              <X onClick={handleOpenSearch} size={30} className="text-black dark:text-white" />
                         </button>
                    </div>
                    <div className="mx-auto max-w-screen-lg p-3 w-full flex-1 py-3">
                         <input type="text"
                              ref={inputRef}
                              placeholder="Search Messages" className=" text-sm outline-none border dark:bg-gray-950 w-full md:w-3/5 mx-auto block py-3 px-3 rounded-lg" />
                    </div>
               </div>
          </div>
     );
}

export default MessageSearch;