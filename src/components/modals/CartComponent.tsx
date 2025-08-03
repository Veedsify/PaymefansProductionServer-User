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
    <section className="w-full mx-auto">
      <div className="grid grid-cols-1 gap-6">
        {cart.map((item, index) => (
          <div
            key={`${item.id}-${item.size?.name || "no-size"}-${index}`}
            className="flex flex-col items-center p-6 mb-3 bg-white border border-gray-300 md:flex-row gap-6 dark:bg-gray-900 rounded-2xl duration-200  dark:border-gray-800"
          >
            <Image
              src={item.images[0].image_url.trimEnd()}
              alt={item.name}
              width={120}
              height={120}
              className="object-cover border border-gray-200 rounded-xl aspect-square dark:border-gray-700"
            />
            <div className="flex-1 w-full">
              <div className="flex flex-col items-start justify-between mb-2 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-base font-medium text-primary-dark-pink dark:text-pink-400">
                    ₦ {item.price.toLocaleString()}
                  </p>
                </div>
                <button
                  className="flex items-center p-2 mt-2 ml-auto text-gray-400 rounded-full md:mt-0 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/30"
                  aria-label="Remove item"
                  onClick={() => removeFromCart(item.id, item.size?.name)}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
              <div className="flex flex-col items-center md:flex-row gap-4">
                <select
                  onChange={(e) =>
                    handleSizeChange(e, item.id, item.size?.name)
                  }
                  value={item.size?.name || ""}
                  className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg dark:border-gray-700 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-dark-pink/30 dark:focus:ring-pink-400/30 md:w-auto"
                >
                  {sizes.map((s) => (
                    <option key={s.name} value={s.name}>
                      {String(s.name).toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="flex items-center overflow-hidden border border-gray-300 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <button
                    onClick={() => removeFromCart(item.id, item.size?.name)}
                    className="px-3 py-2 rounded-l-lg hover:bg-red-50 dark:hover:bg-red-700 transition-colors"
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
                    className="w-12 py-2 font-semibold text-center text-gray-700 bg-transparent border-0 dark:text-gray-200"
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
