import { LucideSearch } from "lucide-react";

const Groups = () => {
  return (
    <>
      <div className="md:py-5 md:px-8 p-3">
        <div className="flex items-center mb-7">
          <span className="font-bold text-xl flex-shrink-0 dark:text-white">
            Groups
          </span>
          <div className="flex items-center justify-center w-8 h-8 aspect-square flex-shrink-0 ml-auto text-white md:py-3 md:px-3 py-1 px-1  bg-primary-text-dark-pink rounded-full font-bold">
            0
          </div>
        </div>
        <div>
          <div className="flex align-baseline justify-between border  dark:text-white border-gray-400 rounded-md p-4 mb-7 w-full ">
            <input
              type="text"
              placeholder="Search Messages In Groups"
              className=" text-sm outline-none border-none  dark:bg-gray-950 w-full"
            />
            <LucideSearch className="block text-center" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Groups;
