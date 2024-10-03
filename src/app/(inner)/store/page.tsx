import CartIcon from "@/components/sub_components/cart-icon";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Store = () => {
    return (
        <section>
            <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <div className="font-bold text-xl flex-shrink-0 mb-3 md:hidden">Store</div>
                <header>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                            All Products
                        </h2>
                        <CartIcon />
                    </div>

                    <p className="mt-4 max-w-md text-gray-500 dark:text-white">
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Itaque
                        praesentium cumque iure dicta incidunt est ipsam, officia dolor
                        fugit natus?
                    </p>
                </header>

                <div className="mt-8">
                    <p className="text-sm text-gray-500 dark:text-white">
                        Showing <span> 4 </span> of 40
                    </p>
                </div>

                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    <li>
                        <a href="#" className="group block overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1671438118257-cefa6c86fd50?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODd8fGJsYWNrJTIwdCUyMHNoaXJ0fGVufDB8fDB8fHww"
                                alt=""
                                width={300}
                                height={400}
                                priority
                                className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                            />

                            <div className="relative bg-white pt-3 p-3 dark:bg-slate-900 dark:text-white">

                                <p className="mb-2">
                                    <span className="tracking-wider text-2xl text-gray-900 dark:text-white">
                                        Basic White T Shirt
                                    </span>
                                </p>
                                <h3 className="dark:text-white text-gray-700 group-hover:underline group-hover:underline-offset-4">
                                    NGN 3,500
                                </h3>
                            </div>
                        </a>
                    </li>
                </ul>

                <ol className="mt-8 flex justify-center gap-1 text-xs font-medium">
                    <li>
                        <a
                            href="#"
                            className="inline-flex size-8 items-center justify-center rounded border border-gray-100"
                        >
                            <span className="sr-only">Prev Page</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </a>
                    </li>

                    <li>
                        <a
                            href="#"
                            className="block size-8 rounded border border-gray-100 text-center leading-8"
                        >
                            1
                        </a>
                    </li>

                    <li className="block size-8 rounded border-black bg-black text-center leading-8 text-white">
                        2
                    </li>

                    <li>
                        <a
                            href="#"
                            className="block size-8 rounded border border-gray-100 text-center leading-8"
                        >
                            3
                        </a>
                    </li>

                    <li>
                        <a
                            href="#"
                            className="block size-8 rounded border border-gray-100 text-center leading-8"
                        >
                            4
                        </a>
                    </li>

                    <li>
                        <a
                            href="#"
                            className="inline-flex size-8 items-center justify-center rounded border border-gray-100"
                        >
                            <span className="sr-only">Next Page</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </a>
                    </li>
                </ol>
            </div>
        </section>
    );
};

export default Store;
