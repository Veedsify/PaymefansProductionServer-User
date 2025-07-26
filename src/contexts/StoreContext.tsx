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
  size?: {
    name: string;
    id?: number;
  };
};

type CartContext = {
  cart: Product[];
  setcart: (cart: Product[]) => void;
  addProduct: (product: Product) => void;
  removeProduct: (id: number, sizeName?: string) => void;
  reduceProductPrice: (id: number, sizeName?: string) => void;
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
          const existingProduct = state.cart.find(
            (p) => p.id === product.id && p.size?.name === product.size?.name,
          );
          if (existingProduct) {
            const updatedCart = state.cart.map((p) =>
              p.id === product.id && p.size?.name === product.size?.name
                ? { ...p, quantity: p.quantity + product.quantity }
                : p,
            );
            return { cart: updatedCart };
          }
          return { cart: [...state.cart, product] };
        }),
      removeProduct: (id, sizeName?: string) =>
        set((state) => ({
          cart: state.cart.filter((p) =>
            sizeName
              ? !(p.id === id && p.size?.name === sizeName)
              : p.id !== id,
          ),
        })),
      reduceProductPrice: (id, sizeName?: string) =>
        set((state) => {
          const updatedCart = state.cart.map((product) => {
            if (
              (sizeName
                ? product.id === id && product.size?.name === sizeName
                : product.id === id) &&
              product.quantity > 1
            ) {
              return { ...product, quantity: product.quantity - 1 };
            }
            return product;
          });
          return { cart: updatedCart };
        }),
      clearcart: () => set({ cart: [] }),
      calculateTotalPrice: (): number => {
        return useCartStore
          .getState()
          .cart.reduce(
            (acc, product) => acc + product.price * product.quantity,
            0,
          );
      },
      total: (): number => {
        return useCartStore.getState().cart.length;
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
