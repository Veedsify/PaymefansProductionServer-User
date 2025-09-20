import { useCallback, useState } from "react";
import type { PostAudienceDataProps } from "@/types/Components";

export const usePostAudience = () => {
  const [dropdown, setDropdown] = useState(false);
  const [postAudience, setPostAudience] =
    useState<PostAudienceDataProps | null>(null);

  const updatePostAudience = useCallback((audience: PostAudienceDataProps) => {
    setPostAudience(audience);
    setDropdown(false);
  }, []);

  return {
    postAudience,
    dropdown,
    setDropdown,
    updatePostAudience,
    setPostAudience,
  };
};
