"use client"
import { useModalContext } from '@/lib/pageContexts';
import { LucideSquarePen, LucideImage, LucideVideo, Videotape } from "lucide-react";
import Link from 'next/link';

const ModalComponent = () => {
  const { modalState, setModal } = useModalContext()
  const onRequestClose = () => {
    setModal()
  }

  return (

    <div
      onClick={onRequestClose}
      className={`fixed w-full h-dvh lg:h-screen bg-black ease-in-out duration-300 bg-opacity-50 z-[100] ${modalState ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>

      <div className={`px-2 xl:w-4/12 md:w-6/12 w-full rounded-tr-xl rounded-tl-xl transition-all duration-300 ease-in-out left-1/2 -translate-x-1/2 absolute ${modalState ? "bottom-0" : "-bottom-full"}`}>
        <div className='p-5 bg-white dark:bg-gray-950 border dark:text-white dark:border-slate-800 rounded-tr-xl rounded-tl-xl'>
          <Link href="/posts/new" className='flex items-center gap-4 px-3 py-5 duration-300 border-b dark:border-slate-800  dark:hover:bg-slate-800 hover:bg-messages-unread'>
            <LucideSquarePen />
            <p>Post</p>
          </Link>
          <Link href="/" className='flex items-center gap-4 px-3 py-5 duration-300 border-b dark:border-slate-800  dark:hover:bg-slate-800 hover:bg-messages-unread'>
            <LucideImage />
            <p>Photo</p>
          </Link>
          <Link href="/" className='flex items-center gap-4 px-3 py-5 duration-300 border-b dark:border-slate-800  dark:hover:bg-slate-800 hover:bg-messages-unread'>
            <Videotape />
            <p>Video</p>
          </Link>
          <Link href="/live" className='flex items-center gap-4 px-3 py-5 duration-300 border-b dark:border-slate-800  dark:hover:bg-slate-800 hover:bg-messages-unread'>
            <LucideVideo />
            <p>Go Live</p>
          </Link>
          <Link href="/story" className='flex items-center gap-4 px-3 py-5 duration-300 dark:border-slate-800   dark:hover:bg-slate-800 hover:bg-messages-unread'>
            <LucideSquarePen />
            <p>Story</p>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default ModalComponent;
