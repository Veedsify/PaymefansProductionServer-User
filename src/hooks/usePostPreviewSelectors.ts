import usePostComponent from "@/contexts/PostComponentPreview";

/**
 * Individual selectors - most stable approach for Zustand
 * Each selector only returns a primitive value or stable reference
 */
export const usePostPreviewRef = () => usePostComponent(state => state.ref);
export const usePostPreviewOtherUrl = () => usePostComponent(state => state.otherUrl);
export const usePostPreviewOpen = () => usePostComponent(state => state.open);
export const usePostPreviewClose = () => usePostComponent(state => state.close);
export const usePostPreviewUsername = () => usePostComponent(state => state.username);
export const usePostPreviewUserProfile = () => usePostComponent(state => state.userProfile);
export const usePostPreviewWatermarkEnabled = () => usePostComponent(state => state.watermarkEnabled);

/**
 * Composite hook that uses individual selectors
 * This prevents object creation and infinite loops
 */
export const usePostPreviewState = () => {
    const ref = usePostPreviewRef();
    const otherUrl = usePostPreviewOtherUrl();
    const open = usePostPreviewOpen();
    const close = usePostPreviewClose();
    const username = usePostPreviewUsername();
    const userProfile = usePostPreviewUserProfile();
    const watermarkEnabled = usePostPreviewWatermarkEnabled();

    return {
        ref,
        otherUrl,
        open,
        close,
        username,
        userProfile,
        watermarkEnabled,
    };
};