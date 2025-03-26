import ROUTE from "@/config/routes";
import { PostData } from "@/types/components";
import axios from "axios";
import { getToken } from "../cookie.get";

export const getUserComments = async (post: PostData, page: number) => {
     try {
          const token = getToken()
          const response = await axios.get(`${ROUTE.GET_COMMENTS(post.id)}?page=${page}`, {
               headers: {
                    "Authorization": `Bearer ${token}`
               }
          })
          if (!response.data.error) {
               return response.data
          }
          return []
     } catch (err: any) {
          console.error(err.message)
     }
}
