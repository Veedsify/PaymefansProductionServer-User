import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ProductImages = {
  id: number;
  image_url: string;
};

type Product = {
  id: number;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  images: ProductImages[];
  description: string;
  instock: number;
  category: {
    name: string;
  };
  size: {
    name: string;
  };
};

type CartContext = {
  cart: Product[];
  setcart: (cart: Product[]) => void;
  addProduct: (product: Product) => void;
  removeProduct: (id: number) => void;
  reduceProductPrice: (id: number) => void;
  clearcart: () => void;
  calculateTotalPrice: () => number;
  total: () => number;
};

export const useCartStore = create<CartContext>()(
  persist(
    (set) => ({
      cart: [],
      setcart: (cart) => set({ cart }),
      addProduct: (product) =>
        set((state) => {
          const existingProduct = state.cart.find((p) => p.id === product.id);
          if (existingProduct) {
            const updatedCart = state.cart.map((p) =>
              p.id === product.id ? { ...product} : p
            );
            return { cart: updatedCart };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),
      removeProduct: (id) =>
        set((state) => ({ cart: state.cart.filter((p) => p.id !== id) })),
      reduceProductPrice: (id) =>
        set((state) => {
          const updatedCart = state.cart.map((product) => {
            if (product.id === id && product.quantity > 1) {
              return { ...product, quantity: product.quantity - 1 }; // Create a new object with updated quantity
            }
            return product; // Return the original product if not matched
          });
          return { cart: updatedCart }; // Return the updated cart
        }),
      clearcart: () => set({ cart: [] }),
      calculateTotalPrice: (): number => {
        return useCartStore
          .getState()
          .cart.reduce((acc, product) => acc + product.price, 0);
      },
      total: (): number => {
        return useCartStore.getState().cart.length;
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
