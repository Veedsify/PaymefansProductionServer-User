import { useQuery } from "@tanstack/react-query";
import { ProfileUserProps } from "@/features/user/types/user";
import getUserProfile from "@/utils/data/ProfileData";
import { checkIfBlockedBy } from "@/utils/data/BlockUser";

type UseProfileOptions = {
  userId: string;
  viewerId: number | null;
  enabled?: boolean;
};

type ProfileData = {
  user: ProfileUserProps;
  isBlockedByUser: boolean;
};

export const useProfile = ({
  userId,
  viewerId,
  enabled = true,
}: UseProfileOptions) => {
  return useQuery({
    queryKey: ["profile", userId, viewerId],
    queryFn: async (): Promise<ProfileData> => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Fetch user profile data
      const profileData = await getUserProfile({
        user_id: decodeURIComponent(userId),
        viewerId,
      });

      let isBlockedByUser = false;

      // Check if current user is blocked by this profile user
      if (profileData && viewerId && profileData.user.id !== viewerId) {
        try {
          const blockResult = await checkIfBlockedBy(profileData.user.id);
          if (blockResult.status && !blockResult.error) {
            isBlockedByUser = blockResult.isBlocked;
          }
        } catch (error) {
          console.error("Error checking block status:", error);
          // Continue without blocking check if it fails
        }
      }

      return {
        user: profileData.user,
        isBlockedByUser,
      };
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 or similar user not found error
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
