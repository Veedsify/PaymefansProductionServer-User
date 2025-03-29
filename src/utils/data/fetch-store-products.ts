import ROUTE from "@/config/routes";
import { StoreAllProductsResponse } from "@/types/components";
import axios from "axios";


const fetchStoreProducts: () => Promise<StoreAllProductsResponse> =
  async () => {
    try {
      const res = await axios.get(ROUTE.FETCH_STORE_PRODUCTS);
      return res.data as StoreAllProductsResponse;
    } catch (error: any) {
      console.error("Error fetching store products:", error);
      return {
        error: true,
        message: "An error occurred while fetching products",
        data: null,
      };
    }
  };

export default fetchStoreProducts;
