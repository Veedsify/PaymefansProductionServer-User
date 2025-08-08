import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import ROUTE from "@/config/routes";
import axiosInstance from "@/utils/Axios";

type CheckoutData = {
  items: Array<{
    product_id: string;
    quantity: number;
    size_id?: number;
  }>;
  shipping_address: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  payment_method: "paystack";
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: async (data: CheckoutData) => {
      const response = await axiosInstance.post(ROUTE.STORE_CHECKOUT, data);
      return response.data;
    },
  });
};

export const useVerifyPayment = (reference: string) => {
  return useQuery({
    queryKey: ["verify-payment", reference],
    queryFn: async () => {
      const response = await axiosInstance.get(ROUTE.VERIFY_PAYMENT(reference));
      return response.data;
    },
    enabled: !!reference,
    retry: 3,
    retryDelay: 1000,
  });
};

export const useUserOrders = () => {
  return useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const response = await axios.get(ROUTE.GET_USER_ORDERS, {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
