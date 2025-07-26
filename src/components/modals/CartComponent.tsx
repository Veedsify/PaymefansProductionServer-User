"use client";
import { useCartStore } from "@/contexts/StoreContext";
import { LucideTrash, X } from "lucide-react";
import Image from "next/image";
import CustomCartPageHooks from "../custom-hooks/CustomCartHooks";
import { ChangeEvent, useEffect, useState } from "react";

const CartComponent = () => {
  const { calculateTotalPrice, addProduct, cart } = useCartStore();
  const { sizes, addToCart, removeFromCart } = CustomCartPageHooks();
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (cart.length > 0) {
      const total = calculateTotalPrice();
      setTotalPrice(total);
    }
  }, [cart, calculateTotalPrice]);

  const handleSizeChange = (
    e: ChangeEvent<HTMLSelectElement>,
    id: number,
    currentSizeName?: string,
  ) => {
    const product = cart.find(
      (p) => p.id === id && p.size?.name === currentSizeName,
    );
    const size = sizes.find((s) => s.name === e.target.value);
    if (product && size) {
      // Remove the old product with current size
      removeFromCart(id, currentSizeName);
      // Add the product with new size
      addProduct({ ...product, size: { name: size.name, id: size.id } });
    }
  };

  return (
    <section className="mx-auto w-full">
      <div className="grid grid-cols-1 gap-6">
        {cart.map((item, index) => (
          <div
            key={`${item.id}-${item.size?.name || "no-size"}-${index}`}
            className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-gray-900 rounded-2xl border-gray-300 duration-200 mb-3 border  dark:border-gray-800"
          >
            <Image
              src={item.images[0].image_url.trimEnd()}
              alt={item.name}
              width={120}
              height={120}
              className="rounded-xl object-cover aspect-square border border-gray-200 dark:border-gray-700"
            />
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {item.name}
                  </h2>
                  <p className="text-primary-dark-pink dark:text-pink-400 font-medium text-base mt-1">
                    ₦ {item.price.toLocaleString()}
                  </p>
                </div>
                <button
                  className="ml-auto mt-2 md:mt-0 flex items-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                  aria-label="Remove item"
                  onClick={() => removeFromCart(item.id, item.size?.name)}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {item.description}
              </p>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <select
                  onChange={(e) =>
                    handleSizeChange(e, item.id, item.size?.name)
                  }
                  value={item.size?.name || ""}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-dark-pink/30 dark:focus:ring-pink-400/30 w-full md:w-auto"
                >
                  {sizes.map((s) => (
                    <option key={s.name} value={s.name}>
                      {String(s.name).toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden">
                  <button
                    onClick={() => removeFromCart(item.id, item.size?.name)}
                    className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-700 transition-colors rounded-l-lg"
                    aria-label="Remove from cart"
                  >
                    <LucideTrash
                      size={18}
                      className="text-red-600 dark:text-red-400"
                    />
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={item.quantity}
                    className="w-12 text-center py-2 text-gray-700 dark:text-gray-200 font-semibold bg-transparent border-0"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CartComponent;
