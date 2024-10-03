import { LucideMinus, LucidePlus, X } from "lucide-react";
import Image from "next/image";

const CartComponent = () => {
     return (
          <div className="grid grid-cols-1">
               <div className="grid p-4 grid-cols-4 gap-4 rounded-lg bg-white shadow mb-4">
                    <Image
                         src="https://images.pexels.com/photos/28302550/pexels-photo-28302550/free-photo-of-a-woman-sitting-on-a-stool-with-her-hair-in-a-bun.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
                         alt="placeholder"
                         width={100}
                         height={100}
                         className="rounded-lg col-span-1 w-full block aspect-square object-cover"
                    />
                    <div className="col-span-3">
                         <div className="flex items-center mb-2">
                              <h1
                                   className="text-lg font-semibold"
                              >
                                   New Shiny Clothes - $100
                              </h1>
                              <button
                                   className="text-white rounded-lg p-1 ml-2">
                                   <X size={20} />
                              </button>
                         </div>
                         <p className="text-xs mb-2">
                              Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum sed reiciendis inventore libero quia facilis minus dolores.
                         </p>
                         <div className="flex items-center justify-between">
                              <select name="" id=""
                                   className="border-gray-300 rounded-md border outline-none p-1 px-4 text-sm mr-2"
                              >
                                   <option value="">
                                        Select Size
                                   </option>
                                   <option value="">
                                        Small
                                   </option>
                                   <option value="">
                                        Medium
                                   </option>
                                   <option value="">
                                        Large
                                   </option>
                                   <option value="">
                                        Extra Large
                                   </option>
                              </select>
                              <div className="flex items-center border rounded">
                                   <button
                                        className="border-r border-gray-300 px-2 py-1 text-sm"
                                   >
                                        <LucideMinus size={15} />
                                   </button>
                                   <input
                                        type="text"
                                        readOnly
                                        defaultValue={2}
                                        className="border-gray-300 text-center w-12 py-1 text-sm"
                                   />
                                   <button
                                        className="border-l border-gray-300 px-2 py-1 text-sm"
                                   >
                                        <LucidePlus size={15} />
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>
               <div className="grid p-4 grid-cols-4 gap-4 rounded-lg bg-white shadow">
                    <Image
                         src="https://images.pexels.com/photos/20715516/pexels-photo-20715516/free-photo-of-african-man-posing-in-denim-outfit.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
                         alt="placeholder"
                         width={100}
                         height={100}
                         className="rounded-lg col-span-1 w-full block aspect-square object-cover"
                    />
                    <div className="col-span-3">
                         <div className="flex items-center mb-2">
                              <h1
                                   className="text-lg font-semibold"
                              >
                                   New Shiny Clothes - $100
                              </h1>
                              <button
                                   className="text-white rounded-lg p-1 ml-2">
                                   <X size={20} />
                              </button>
                         </div>
                         <p className="text-xs mb-2">
                              Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum sed reiciendis inventore libero quia facilis minus dolores.
                         </p>
                         <div className="flex items-center justify-between">
                              <select name="" id=""
                                   className="border-gray-300 rounded-md border outline-none p-1 px-4 text-sm mr-2"
                              >
                                   <option value="">
                                        Select Size
                                   </option>
                                   <option value="">
                                        Small
                                   </option>
                                   <option value="">
                                        Medium
                                   </option>
                                   <option value="">
                                        Large
                                   </option>
                                   <option value="">
                                        Extra Large
                                   </option>
                              </select>
                              <div className="flex items-center border rounded">
                                   <button
                                        className="border-r border-gray-300 px-2 py-1 text-sm"
                                   >
                                        <LucideMinus size={15} />
                                   </button>
                                   <input
                                        type="text"
                                        readOnly
                                        defaultValue={2}
                                        className="border-gray-300 text-center w-12 py-1 text-sm"
                                   />
                                   <button
                                        className="border-l border-gray-300 px-2 py-1 text-sm"
                                   >
                                        <LucidePlus size={15} />
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}

export default CartComponent;