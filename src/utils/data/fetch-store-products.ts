import ROUTE from "@/config/routes";
import { fetstoreProps } from "@/types/components";
import axios from "axios";


const fetchStoreProducts: () => Promise<fetstoreProps> = async () => {
     try {
          const res = await axios.get(ROUTE.FETCH_STORE_PRODUCTS);

          if (res.status === 200) {
               return {
                    error: false,
                    data: res.data.data
               }
          } else {
               return {
                    error: true,
                    message: res.data.data.message
               }
          }

     } catch (error: any) {
          return {
               error: true,
               message: error.message as unknown as string
          }
     }
}

export default fetchStoreProducts;
