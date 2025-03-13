"use client";
import { useCartStore } from "@/contexts/store-context";
import { LucideMinus, LucidePlus, LucideTrash, X } from "lucide-react";
import Image from "next/image";
import CustomCartPageHooks from "../custom-hooks/custom-cart-hooks";
import { ChangeEvent } from "react";

const CartComponent = () => {
  const { calculateTotalPrice, addProduct, cart } = useCartStore();
  const { sizes, addToCart, removeFromCart } = CustomCartPageHooks();

  const handleSizeChange = (e: ChangeEvent<HTMLSelectElement>, id: number) => {
    const product = cart.find((p) => p.id === id);
    const size = sizes.find((s) => s.name === e.target.value);
    if (product && size) {
      addProduct({ ...product, size });
    }
  };
  return (
    <>
      <div className="grid grid-cols-1">
        {cart.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-6 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 mb-4"
          >
            <Image
              src={item.images[0].image_url.trimEnd()}
              alt={item.name}
              width={120}
              height={120}
              className="rounded-lg object-cover aspect-square flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">
                    {item.name}
                  </h1>
                  <p className="text-primary-dark-pink font-medium">
                    ₦ {item.price.toLocaleString()}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <div className="flex items-center justify-between">
                <select
                  onChange={(e) => handleSizeChange(e, item.id)}
                  defaultValue={item.size.name}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-dark-pink/20"
                >
                  {sizes.map((s) => (
                    <option key={s.name} value={s.name}>
                      {String(s.name).toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <LucideTrash size={16} className="text-red-600" />
                  </button>
                  <input
                    type="text"
                    readOnly
                    defaultValue={item.quantity}
                    className="w-12 text-center py-2 text-gray-700 font-medium"
                  />
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
          <button className="bg-primary-dark-pink hover:bg-primary-text-dark-pink duration-200 text-white text-sm font-bold py-2 px-4 rounded-lg">
            Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default CartComponent;
