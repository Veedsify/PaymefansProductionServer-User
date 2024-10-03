import { useCartStore } from "@/contexts/store-context";
import { useState } from "react";

const CustomCartPageHooks = () => {
     const { addProduct, reduceProductPrice } = useCartStore()
     const [sizes, setSizes] = useState([
          { id: 1, name: "small" },
          { id: 2, name: "medium" },
          { id: 3, name: "large" },
          { id: 4, name: "extra-large" }
     ])

     const addToCart = (item: any) => {
          addProduct(item)
     }

     const removeFromCart = (id: any) => {
          reduceProductPrice(id)
     }




     return { sizes, addToCart, removeFromCart }
}

export default CustomCartPageHooks;