import axios from "axios";
import ROUTE from "@/config/routes";
import type { StoreAllProductsResponse } from "@/types/Components";

const fetchStoreProducts: (page: number) => Promise<StoreAllProductsResponse> =
  async (page) => {
    try {
      const res = await axios.get(ROUTE.FETCH_STORE_PRODUCTS(page));
      return res.data as StoreAllProductsResponse;
    } catch (error: any) {
      console.error("Error fetching store products:", error);
      throw new Error(
        "An error occurred while fetching store products. Please try again later.",
      );
    }
  };

export default fetchStoreProducts;
