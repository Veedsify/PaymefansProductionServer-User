import { useCallback, useEffect, useRef, useState } from "react";

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  enabled?: boolean;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  enabled = true,
}: SwipeGestureOptions) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const minSwipeDistance = threshold;

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
      setIsDragging(true);
    },
    [enabled]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !isDragging || touchStart === null) return;
      const currentTouch = e.targetTouches[0].clientX;
      setTouchEnd(currentTouch);
      setDragOffset(currentTouch - touchStart);
    },
    [enabled, isDragging, touchStart]
  );

  const onTouchEnd = useCallback(() => {
    if (!enabled || !touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  }, [
    enabled,
    touchStart,
    touchEnd,
    minSwipeDistance,
    onSwipeLeft,
    onSwipeRight,
  ]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isdragging: isDragging.toString(),
    dragOffset,
  };
};
