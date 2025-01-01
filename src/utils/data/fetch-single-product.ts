import ROUTE from "@/config/routes";
import { fetchSingleProps, fetstoreProps } from "@/types/components";
import axios from "axios";


const fetchSingleProduct: (product_id: string) => Promise<fetchSingleProps> = async (product_id) => {
     try {
          const res = await axios.get(`${ROUTE.FETCH_PRODUCT}/${product_id}`);

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

export default fetchSingleProduct;
