import { useCallback, useEffect, useRef, useState } from "react";

interface PinchZoomOptions {
  minZoom?: number;
  maxZoom?: number;
  enabled?: boolean;
}

interface PinchZoomState {
  scale: number;
  posX: number;
  posY: number;
}

export const usePinchZoom = ({
  minZoom = 1,
  maxZoom = 4,
  enabled = true,
}: PinchZoomOptions = {}) => {
  const [transform, setTransform] = useState<PinchZoomState>({
    scale: 1,
    posX: 0,
    posY: 0,
  });

  const lastDistance = useRef<number | null>(null);
  const lastCenter = useRef<{ x: number; y: number } | null>(null);
  const isPinching = useRef(false);

  const getDistance = useCallback(
    (touch1: React.Touch, touch2: React.Touch) => {
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    },
    []
  );

  const getCenter = useCallback((touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || e.touches.length !== 2) return;

      e.preventDefault();
      isPinching.current = true;

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      lastDistance.current = getDistance(touch1, touch2);
      lastCenter.current = getCenter(touch1, touch2);
    },
    [enabled, getDistance, getCenter]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !isPinching.current || e.touches.length !== 2) return;

      e.preventDefault();

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const distance = getDistance(touch1, touch2);
      const center = getCenter(touch1, touch2);

      if (lastDistance.current && lastCenter.current) {
        const scaleDelta = distance / lastDistance.current;
        const newScale = Math.max(
          minZoom,
          Math.min(maxZoom, transform.scale * scaleDelta)
        );

        // Calculate new position to zoom towards the pinch center
        const deltaX = center.x - lastCenter.current.x;
        const deltaY = center.y - lastCenter.current.y;

        setTransform({
          scale: newScale,
          posX: transform.posX + deltaX,
          posY: transform.posY + deltaY,
        });
      }

      lastDistance.current = distance;
      lastCenter.current = center;
    },
    [enabled, getDistance, getCenter, transform, minZoom, maxZoom]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled) return;

    isPinching.current = false;
    lastDistance.current = null;
    lastCenter.current = null;

    // Reset zoom if it's close to minimum
    if (transform.scale < minZoom + 0.1) {
      setTransform({ scale: 1, posX: 0, posY: 0 });
    }
  }, [enabled, transform.scale, minZoom]);

  const resetZoom = useCallback(() => {
    setTransform({ scale: 1, posX: 0, posY: 0 });
  }, []);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;

      if (transform.scale > 1) {
        resetZoom();
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        setTransform({
          scale: 2,
          posX: -x,
          posY: -y,
        });
      }
    },
    [enabled, transform.scale, resetZoom]
  );

  return {
    transform,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onDoubleClick: handleDoubleClick,
    },
    resetZoom,
    isZoomed: transform.scale > 1,
  };
};
