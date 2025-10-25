// Centralized constants for media preview components
export const MEDIA_CONSTANTS = {
  ANIMATION_DURATION: 200,
  ANIMATION_DURATION_SEC: 200 / 1000,
  IMAGE_DIMENSIONS: { width: 1500, height: 1500 },
  PRELOAD_RANGE: 3,
  IMAGE_QUALITY: {
    HIGH: 90,
    MEDIUM: 75,
    LOW: 50,
  },
  SWIPE_THRESHOLD: 50,
  ZOOM_LIMITS: {
    MIN: 1,
    MAX: 4,
  },
};

// Types
export interface MediaItem {
  url: string;
  isBlob?: boolean;
  type: "image" | "video";
  alt?: string;
  thumbnailUrl?: string;
}

export interface UserProfile {
  name: string;
  username: string;
  avatar?: string;
}

// Media loading state reducer
type MediaState = { loaded: Set<number>; errors: Set<number> };
type MediaAction =
  | { type: "LOAD_SUCCESS"; index: number }
  | { type: "LOAD_ERROR"; index: number }
  | { type: "RESET" };

export const mediaReducer = (
  state: MediaState,
  action: MediaAction,
): MediaState => {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return { ...state, loaded: new Set([...state.loaded, action.index]) };
    case "LOAD_ERROR":
      return {
        ...state,
        errors: new Set([...state.errors, action.index]),
        loaded: new Set([...state.loaded, action.index]),
      };
    case "RESET":
      return { loaded: new Set(), errors: new Set() };
    default:
      return state;
  }
};

// Preload media utility with caching
export const preloadMedia = (() => {
  const cache = new Set<string>();

  return (url: string, type: "image" | "video") => {
    if (cache.has(url)) return;
    cache.add(url);

    if (type === "image") {
      const img = new window.Image();
      img.src = url;
    } else {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
    }
  };
})();
