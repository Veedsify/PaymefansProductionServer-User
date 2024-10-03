const page = () => {
     return (
          <div className="relative p-2 md:p-5">
               <h2 className="font-bold text-sm text-gray-600 mb-3">
                    Customer Details
               </h2>
               <div>
                    <form action="" className="grid grid-cols-2 border p-2 gap-3 rounded mb-5">
                         <div className="col-span-2">
                              <input type="text" placeholder="Full Name" className="border-gray-300 border-b outline-none p-3 text-xs w-full" />
                         </div>
                         <div className="col-span-1">
                              <input type="text" placeholder="Phone" className="border-gray-300 border-b outline-none p-3 text-xs w-full" />
                         </div>
                         <div className="col-span-1">
                              <input type="email" placeholder="Email" className="border-gray-300 border-b outline-none p-3 text-xs w-full" />
                         </div>
                         <div className="col-span-1">
                              <h2 className="font-bold text-xs text-gray-400 ml-1">
                                   Shipping Details
                              </h2>
                         </div>
                         <div className="col-span-2">
                              <select
                                   name="country"
                                   className="border-gray-300 border-b outline-none p-3 text-xs w-full" >
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
                                   className="border-gray-300 border-b outline-none p-3 text-xs w-full" >
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
                              <input type="zip" placeholder="Zip Code" className="border-gray-300 border-b outline-none p-3 text-xs w-full" />
                         </div>
                         <div className="col-span-2">
                              <input type="text"
                                   name="address"
                                   placeholder="Shipping Address" className="border-gray-300 outline-none p-3 text-xs w-full" />
                         </div>
                    </form>
               </div>
               <h2 className="font-bold text-sm text-gray-600 mb-3">
                    Payment Method
               </h2>
               <div className="grid grid-cols-2 gap-3 rounded mb-3 py-2">
                    <div className="col-span-1">
                         <button className="border-gray-300 border rounded outline-none p-3 text-xs w-full hover:outline-2 hover:outline-primary-dark-pink">
                              Pay With Points
                         </button>
                    </div>
                    <div className="col-span-1">
                         <button className="border-gray-300 border rounded outline-none p-3 text-xs w-full hover:outline-2 hover:outline-primary-dark-pink">
                              Pay With Card/Bank/Transfer
                         </button>
                    </div>
               </div>
               <div className="col-span-2">
                    <button
                         className="bg-primary-dark-pink text-white rounded p-2 text-xs w-full">
                         Pay Now
                    </button>
               </div>
          </div>
     );
}

export default page;