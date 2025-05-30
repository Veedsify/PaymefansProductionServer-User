import { useCartStore } from "@/contexts/StoreContext";
import { useState } from "react";
import toast from "react-hot-toast";

const CustomCartPageHooks = () => {
  const { addProduct, reduceProductPrice, removeProduct } = useCartStore();
  const [sizes, setSizes] = useState([
    { name: "S" },
    { name: "M" },
    { name: "L" },
    { name: "XL" },
  ]);

  const addToCart = (item: any) => {
    addProduct(item);
  };

  const removeFromCart = (id: any) => {
    removeProduct(id);
    toast.error("Item removed from cart");
  };

  return { sizes, addToCart, removeFromCart };
};

export default CustomCartPageHooks;
