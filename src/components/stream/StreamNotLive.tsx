import Link from "next/link";

const StreamNotLive = () => {
     return (
          <section className="h-full flex-1 items-center flex">
               <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
                    <div className="mx-auto max-w-screen-sm text-center">
                         <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-white">404</h1>
                         <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">Something&apos;s missing.</p>
                         <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
                              This stream is not active yet, or has ended. Please try again later.
                         </p>
                         <Link href="#" className="inline-flex text-black bg-primary-600 hover:bg-primary-800 focus:ring-4 dark:text-white focus:outline-none focus:ring-primary-300 font-medium rounded-lg border px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4">Back to Homepage</Link>
                    </div>
               </div>
          </section>
     );
}

export default StreamNotLive;