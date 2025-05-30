import ROUTE from "@/config/routes";
import { PostData } from "@/types/Components";
import axios from "axios";
import { getToken } from "../Cookie";

export const getUserComments = async (post: PostData, page: number) => {
     try {
          const token = getToken()
          const response = await axios.get(`${ROUTE.GET_COMMENTS(post.post_id)}?page=${page}`, {
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
