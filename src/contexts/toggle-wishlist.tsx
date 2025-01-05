"use client";
import { createContext, ReactNode, useContext, useState } from "react";

type ToggleWishListContextType = {
  wishList: boolean;
  toggleWishList: () => void;
};

const ToggleWishListContext = createContext<ToggleWishListContextType | null>(
  null
);

export const useToggleWishList = () => {
  const context = useContext(ToggleWishListContext);
  if (!context) {
    throw new Error(
      "useToggleWishList must be used within a ToggleWishListProvider or wishList is undefined"
    );
  }
  return context;
};

const ToggleWishListProvider = ({ children }: { children: ReactNode }) => {
  const [wishList, setWishList] = useState(false);

  const toggleWishList = () => {
    setWishList(!wishList);
  };

  return (
    <ToggleWishListContext.Provider value={{ toggleWishList, wishList }}>
      {children}
    </ToggleWishListContext.Provider>
  );
};

export default ToggleWishListProvider;
