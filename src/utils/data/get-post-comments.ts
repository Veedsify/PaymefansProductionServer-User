import ROUTE from "@/config/routes";
import { PostData } from "@/types/components";
import axios from "axios";
import { getToken } from "../cookie.get";

export const getUserComments = async (post: PostData) => {
     try {
          const token = getToken()
          const response = await axios.get(ROUTE.GET_COMMENTS(post.id), {
               headers: {
                    "Authorization": `Bearer ${token}`
               }
          })

          if(response.data.status === true){
               return response.data.data
          }

          return []
     } catch (err: any) {
          console.error(err.message)
     }
}
