import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useWishlistStore } from "@/contexts/WishlistContext";
import toast from "react-hot-toast";
import ROUTE from "@/config/routes";

// Add to wishlist
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { addToWishlist } = useWishlistStore();

  return useMutation({
    mutationFn: async ({
      productId,
      product,
    }: {
      productId: string;
      product: any;
    }) => {
      const response = await axios.post(
        ROUTE.WISHLIST_ADD,
        { productId, product },
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      addToWishlist(variables.product);
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
      toast.success("Product added to wishlist");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to add to wishlist";
      toast.error(message);
    },
  });
};

// Remove from wishlist
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const { removeFromWishlist } = useWishlistStore();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await axios.delete(ROUTE.WISHLIST_REMOVE(productId), {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (data, productId) => {
      removeFromWishlist(productId);
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
      toast.success("Product removed from wishlist");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to remove from wishlist";
      toast.error(message);
    },
  });
};

// Get user's wishlist
export const useWishlist = () => {
  const { setWishlist } = useWishlistStore();

  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await axios.get(ROUTE.WISHLIST_GET, {
        withCredentials: true,
      });
      const wishlistData = response.data.data || [];
      // Update local store with server data
      setWishlist(wishlistData.map((item: any) => item.product));
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Check if product is in wishlist
export const useCheckWishlist = (productId: string) => {
  return useQuery({
    queryKey: ["wishlist-check", productId],
    queryFn: async () => {
      const response = await axios.get(ROUTE.WISHLIST_CHECK(productId), {
        withCredentials: true,
      });
      return response.data;
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get wishlist count
export const useWishlistCount = () => {
  return useQuery({
    queryKey: ["wishlist-count"],
    queryFn: async () => {
      const response = await axios.get(ROUTE.WISHLIST_COUNT, {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Clear wishlist
export const useClearWishlist = () => {
  const queryClient = useQueryClient();
  const { clearWishlist } = useWishlistStore();

  return useMutation({
    mutationFn: async () => {
      const response = await axios.delete(ROUTE.WISHLIST_CLEAR, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      clearWishlist();
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] });
      toast.success("Wishlist cleared successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to clear wishlist";
      toast.error(message);
    },
  });
};

// Toggle wishlist (add/remove based on current state)
export const useToggleWishlist = () => {
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();
  const { isInWishlist } = useWishlistStore();

  return {
    toggleWishlist: (productId: string, product: any) => {
      if (isInWishlist(productId)) {
        removeMutation.mutate(productId);
      } else {
        addMutation.mutate({ productId, product });
      }
    },
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
};
