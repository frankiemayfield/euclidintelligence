import { useCallback, useEffect, useRef, useState } from "react";

interface CanvasTransform {
  zoom: number;
  panX: number;
  panY: number;
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.08;

export function useCanvasNavigation(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [transform, setTransform] = useState<CanvasTransform>({ zoom: 1, panX: 0, panY: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Scroll-wheel zoom centered on cursor
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 0) {
        // Only zoom if it looks like a pinch or scroll (not horizontal scroll)
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        setTransform(prev => {
          const direction = e.deltaY < 0 ? 1 : -1;
          const factor = 1 + ZOOM_STEP * direction;
          const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * factor));
          const scale = newZoom / prev.zoom;

          // Zoom toward cursor position
          const newPanX = cursorX - scale * (cursorX - prev.panX);
          const newPanY = cursorY - scale * (cursorY - prev.panY);

          return { zoom: newZoom, panX: newPanX, panY: newPanY };
        });
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [containerRef]);

  // Space key for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        setIsSpaceHeld(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpaceHeld(false);
        setIsPanning(false);
        panStart.current = null;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Space + left click OR middle mouse button → start pan
    if ((isSpaceHeld && e.button === 0) || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: transform.panX, panY: transform.panY };
    }
  }, [isSpaceHeld, transform.panX, transform.panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !panStart.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setTransform(prev => ({
      ...prev,
      panX: panStart.current!.panX + dx,
      panY: panStart.current!.panY + dy,
    }));
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      panStart.current = null;
    }
  }, [isPanning]);

  // Double-click: zoom to fit (reset)
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // Only if space held or no active drawing tool context
    if (e.detail === 2) {
      setTransform({ zoom: 1, panX: 0, panY: 0 });
    }
  }, []);

  const setZoom = useCallback((newZoom: number | ((prev: number) => number)) => {
    setTransform(prev => {
      const z = typeof newZoom === "function" ? newZoom(prev.zoom) : newZoom;
      return { ...prev, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)) };
    });
  }, []);

  const resetView = useCallback(() => {
    setTransform({ zoom: 1, panX: 0, panY: 0 });
  }, []);

  return {
    transform,
    isPanning: isPanning || isSpaceHeld,
    isSpaceHeld,
    setZoom,
    resetView,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
  };
}
