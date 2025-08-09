import axiosInstance from "../Axios";
import { getToken } from "../Cookie";

interface PayForPostProps {
  price: number;
  postId: number;
}

const payForPost = async ({ price, postId }: PayForPostProps) => {
  try {
    // Make sure to import axios at the top of your file: import axios from "axios";
    const response = await axiosInstance.post(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/pay`,
      {
        price,
        postId,
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error during payment processing:", error);
    return {
      error: true,
      message:
        error.message || "An error occurred while processing the payment",
    };
  }
};

export default payForPost;
