// import axios from "axios";
// import axiosInstance from "../axios";

// export const sideModels = async () => {
//   return axiosInstance.post(`${process.env.NEXT_PUBLIC_EXPRESS_URL}/models/all`, {
//     limit: 4,
//   }, {
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer {cookies().get('token')?.value}`
//     }
//   }).then((res) => {
//     return res.data;
//   }
//   ).catch((err) => {
//     return err;
//   });
// }