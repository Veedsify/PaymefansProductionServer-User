import { useQuery } from "@tanstack/react-query";
import type { ProfileUserProps } from "@/features/user/types/user";
import { checkIfBlockedBy } from "@/utils/data/BlockUser";
import getUserProfile from "@/utils/data/ProfileData";

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
        const blockResult = await checkIfBlockedBy(profileData.user.id);
        if (blockResult.status && !blockResult.error) {
          isBlockedByUser = blockResult.isBlocked;
        }
      }

      return {
        user: profileData.user,
        isBlockedByUser,
      };
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
