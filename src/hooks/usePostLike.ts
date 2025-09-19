// hooks/usePostLike.ts
import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/contexts/UserUseContext";
import { useGuestModal } from "@/contexts/GuestModalContext";
import { likePost, getPostLikeData } from "@/utils/PostLikeUtils";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface UsePostLikeProps {
    postId: string;
    initialLikeCount?: number;
    initialIsLiked?: boolean;
}

interface UsePostLikeReturn {
    likeCount: number;
    isLiked: boolean;
    isLoading: boolean;
    handleLike: () => Promise<void>;
    refreshLikeData: () => Promise<void>;
}

export const usePostLike = ({
    postId,
    initialLikeCount = 0,
    initialIsLiked = false,
}: UsePostLikeProps): UsePostLikeReturn => {
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLoading, setIsLoading] = useState(false);

    const { user, isGuest } = useAuthContext();
    const toggleModalOpen = useGuestModal((state) => state.toggleModalOpen);
    const queryClient = useQueryClient();

    // Refresh like data from server
    const refreshLikeData = useCallback(async () => {
        try {
            const data = await getPostLikeData(postId);
            setLikeCount(data.likeCount);
            setIsLiked(data.isLiked);
        } catch (error) {
            console.error("Error refreshing like data:", error);
        }
    }, [postId]);

    // Handle like/unlike action
    const handleLike = useCallback(async () => {
        if (isGuest) {
            toggleModalOpen("You need to login to like this post.");
            return;
        }

        if (isLoading || !postId) {
            return;
        }

        setIsLoading(true);

        // Optimistic UI update
        const wasLiked = isLiked;
        const previousCount = likeCount;

        setIsLiked(!wasLiked);
        setLikeCount(wasLiked ? Math.max(previousCount - 1, 0) : previousCount + 1);

        try {
            const response = await likePost(postId);

            if (response.success) {
                // Update with actual response from server
                setIsLiked(response.isLiked);
                setLikeCount(response.likeCount);

                // Invalidate related queries to refresh cached data
                await queryClient.invalidateQueries({
                    queryKey: ["personal-posts"],
                });
                await queryClient.invalidateQueries({
                    queryKey: ["posts", postId],
                });
                await queryClient.invalidateQueries({
                    queryKey: ["homeFeed"],
                });
                await queryClient.invalidateQueries({
                    queryKey: ["post", postId],
                });
            } else {
                // Revert optimistic update on failure
                setIsLiked(wasLiked);
                setLikeCount(previousCount);
                toast.error("Failed to update like status");
            }
        } catch (error: any) {
            console.error("Error in handleLike:", error);

            // Revert optimistic update on error
            setIsLiked(wasLiked);
            setLikeCount(previousCount);

            toast.error(error.message || "Failed to update like status");
        } finally {
            setIsLoading(false);
        }
    }, [
        isGuest,
        isLoading,
        postId,
        isLiked,
        likeCount,
        toggleModalOpen,
        queryClient,
    ]);

    // Initialize with actual server data if different from initial values
    useEffect(() => {
        // Only set initial values once on mount, don't refresh from server
        // This prevents conflicts with real-time updates
        if (postId) {
            setLikeCount(initialLikeCount);
            setIsLiked(initialIsLiked);
        }
    }, [postId, initialLikeCount, initialIsLiked]);

    return {
        likeCount,
        isLiked,
        isLoading,
        handleLike,
        refreshLikeData,
    };
};