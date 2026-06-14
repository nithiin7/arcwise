import { useRef, useState } from "react";

interface DragResizeOptions {
  min?: number;
  max?: number;
  initialHeight?: number | null;
}

export function useDragResize({ min = 60, max = 500, initialHeight = null }: DragResizeOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(initialHeight);

  function onDragStart(e: React.MouseEvent) {
    const startY = e.clientY;
    const startH = ref.current?.getBoundingClientRect().height ?? 180;
    const onMove = (ev: MouseEvent) => {
      setHeight(Math.max(min, Math.min(max, startH + (ev.clientY - startY))));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    e.preventDefault();
  }

  return { ref, height, onDragStart };
}
