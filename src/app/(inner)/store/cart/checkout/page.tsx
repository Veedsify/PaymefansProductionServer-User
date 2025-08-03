"use client";

import { LucideArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


const Page = () => {
     const [paymentMethod, setPaymentMethod] = useState<"points" | "paystack">("points");
     return (
          <div className="px-4 py-8 mx-auto max-w-screen-xl sm:px-6 lg:px-8">
               <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-600">
                         Customer Details
                    </h2>
                    <Link href="/store/cart" className="flex items-center text-xs font-semibold text-primary-dark-pink hover:text-primary-text-dark-pink duration-200">
                         <LucideArrowLeft size={15} /> Back to Cart
                    </Link>
               </div>
               <div>
                    <form action="" className="p-2 mb-5 border rounded grid grid-cols-2 gap-3">
                         <div className="col-span-2">
                              <input type="text" placeholder="Full Name" className="w-full p-3 text-xs border-b border-gray-300 outline-none" />
                         </div>
                         <div className="col-span-1">
                              <input type="text" placeholder="Phone" className="w-full p-3 text-xs border-b border-gray-300 outline-none" />
                         </div>
                         <div className="col-span-1">
                              <input type="email" placeholder="Email" className="w-full p-3 text-xs border-b border-gray-300 outline-none" />
                         </div>
                         <div className="col-span-1">
                              <h2 className="ml-1 text-xs font-bold text-gray-400">
                                   Shipping Details
                              </h2>
                         </div>
                         <div className="col-span-2">
                              <select
                                   name="country"
                                   className="w-full p-3 text-xs border-b border-gray-300 outline-none" >
                                   <option value="" selected>
                                        Select Country
                                   </option>
                                   <option value="">
                                        Nigeria
                                   </option>
                                   <option value="">
                                        Ghana
                                   </option>
                                   <option value="">
                                        Kenya
                                   </option>
                                   <option value="">
                                        South Africa
                                   </option>
                              </select>
                         </div>
                         <div className="col-span-1">
                              <select
                                   className="w-full p-3 text-xs border-b border-gray-300 outline-none" >
                                   <option value="" selected>
                                        Select State
                                   </option>
                                   <option value="">
                                        Nigeria
                                   </option>
                                   <option value="">
                                        Ghana
                                   </option>
                                   <option value="">
                                        Kenya
                                   </option>
                                   <option value="">
                                        South Africa
                                   </option>
                              </select>
                         </div>
                         <div className="col-span-1">
                              <input type="zip" placeholder="Zip Code" className="w-full p-3 text-xs border-b border-gray-300 outline-none" />
                         </div>
                         <div className="col-span-2">
                              <input type="text"
                                   name="address"
                                   placeholder="Shipping Address" className="w-full p-3 text-xs border-gray-300 outline-none" />
                         </div>
                    </form>
               </div>
               <h2 className="mb-3 text-sm font-bold text-gray-600">
                    Payment Method
               </h2>
               <div className="py-2 mb-3 rounded grid grid-cols-2 gap-3">
                    <div className="col-span-1">
                         <button
                              onClick={() => setPaymentMethod("points")}
                              className={`border-gray-300 border rounded outline-none p-3 text-xs w-full hover:outline-2 ${paymentMethod === "points" && "outline-primary-dark-pink bg-primary-dark-pink text-white"}`}>
                              Pay With Points
                         </button>
                    </div>
                    <div className="col-span-1">
                         <button
                              onClick={() => setPaymentMethod("paystack")}
                              className={`border-gray-300 border rounded outline-none p-3 text-xs w-full hover:outline-2 ${paymentMethod === "paystack" && "outline-primary-dark-pink bg-primary-dark-pink text-white"}`}>
                              Pay With Card/Bank/Transfer
                         </button>
                    </div>
               </div>
               <div className="col-span-2">
                    <button
                         className="w-full p-3 text-xs font-bold text-white rounded bg-primary-dark-pink">
                         Pay Now
                    </button>
               </div>
          </div>
     );
}

export default Page;