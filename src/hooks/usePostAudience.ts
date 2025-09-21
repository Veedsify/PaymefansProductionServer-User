import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import type { PostAudienceDataProps } from "@/types/Components";

export const usePostAudience = (postAudienceData: PostAudienceDataProps[]) => {
  const [dropdown, setDropdown] = useState(false);
  const [postAudience, setPostAudience] =
    useState<PostAudienceDataProps | null>(null);

  const updatePostAudience = useCallback((audience: PostAudienceDataProps) => {
    setPostAudience(audience);
    setDropdown(false);
  }, []);

  useLayoutEffect(() => {
    setPostAudience(
      postAudienceData.find((audience) => audience.name == "Public") || null,
    );
  }, [postAudienceData]);

  return {
    postAudience,
    dropdown,
    setDropdown,
    updatePostAudience,
    setPostAudience,
  };
};
