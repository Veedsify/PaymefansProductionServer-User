import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/contexts/StoreContext";

const CustomCartPageHooks = () => {
  const { addProduct, reduceProductPrice, removeProduct } = useCartStore();
  const [sizes, setSizes] = useState([
    { name: "S", id: 1 },
    { name: "M", id: 2 },
    { name: "L", id: 3 },
    { name: "XL", id: 4 },
  ]);

  const addToCart = (item: any) => {
    addProduct(item);
  };

  const removeFromCart = (id: any, sizeName?: string) => {
    removeProduct(id, sizeName);
    toast.error("Item removed from cart");
  };

  return { sizes, addToCart, removeFromCart };
};

export default CustomCartPageHooks;
