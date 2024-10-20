"use client"
import { useCartStore } from "@/contexts/store-context";
import { LucideMinus, LucidePlus, X } from "lucide-react";
import Image from "next/image";
import CustomCartPageHooks from "../custom-hooks/custom-cart-hooks";

const CartComponent = () => {
     const { calculateTotalPrice, cart } = useCartStore()
     const { sizes, addToCart, removeFromCart } = CustomCartPageHooks()

     return (
          <>
               <div className="grid grid-cols-1">
                    {cart.map(item => (
                         <div className="grid p-4 grid-cols-4 gap-4 rounded bg-white shadow duration-200 mb-4">
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
                                             {item.name} - ₦ {item.price}
                                        </h1>
                                        <button
                                             className="text-white rounded-lg p-1 ml-2">
                                             <X size={20} />
                                        </button>
                                   </div>
                                   <p className="text-xs mb-2">
                                        {item.description}
                                   </p>
                                   <div className="flex items-center justify-between">
                                        <select name="" id=""
                                             className="border-gray-300 rounded-md border outline-none p-1 px-4 text-sm mr-2"
                                        >
                                             {sizes.map(s => (
                                                  <option value={s.id} selected={item.sizes.id === s.id}>
                                                       {String(s.name).toUpperCase()}
                                                  </option>
                                             ))}
                                        </select>
                                        <div className="flex items-center border rounded">
                                             <button
                                                  onClick={() => addToCart(item)}
                                                  className="border-r border-gray-300 px-2 py-1 text-sm"
                                             >
                                                  <LucideMinus size={15} />
                                             </button>
                                             <input
                                                  type="text"
                                                  readOnly
                                                  defaultValue={item.quantity}
                                                  className="border-gray-300 text-center w-12 py-1 text-sm"
                                             />
                                             <button
                                                  onClick={() => removeFromCart(item.id)}
                                                  className="border-l border-gray-300 px-2 py-1 text-sm"
                                             >
                                                  <LucidePlus size={15} />
                                             </button>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    ))}
               </div>
               <div>
                    <div className="flex items-center justify-between bg-white rounded">
                         <h1 className="text-lg font-semibold">
                              Total: ₦ {calculateTotalPrice().toLocaleString()}
                         </h1>
                         <button
                              className="bg-primary-dark-pink hover:bg-primary-text-dark-pink duration-200 text-white text-sm font-bold py-2 px-4 rounded-lg"
                         >
                              Checkout
                         </button>
                    </div>
               </div>
          </>
     );
}

export default CartComponent;