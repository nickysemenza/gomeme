import { useCallback, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Target, Point, Deltas } from "~/lib/schemas";
import { clampTopLeft, clampSize, zeroDeltas, POLY_TO_DELTA } from "~/lib/geometry";

export type DragType = "move" | "resize" | "skew";

interface DragState {
  type: DragType;
  index: number;
  cornerIndex: number;
  pointerId: number;
  startPointer: Point; // in template coordinates
  startTarget: Target;
}

export interface DragInteraction {
  /** The target being dragged, with the in-progress change applied (or null). */
  preview: { index: number; target: Target } | null;
  beginDrag: (
    e: React.PointerEvent,
    index: number,
    type: DragType,
    cornerIndex?: number,
  ) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
}

interface Args {
  canvasRef: RefObject<HTMLElement | null>;
  targets: Target[];
  bounds: Point; // template size
  scale: number; // template units per displayed pixel
  onCommit: (index: number, target: Target) => void;
  onSelect: (index: number) => void;
}

const round = (p: Point): Point => ({ x: Math.round(p.x), y: Math.round(p.y) });

/**
 * Drag-to-edit with Pointer Events. The in-progress change lives in local
 * `preview` state and is committed to the editor (one undo entry) only on
 * pointer-up, so dragging doesn't thrash the whole template through the reducer
 * on every tick. `setPointerCapture` keeps the drag alive outside the canvas.
 */
export function useDragInteraction({
  canvasRef,
  targets,
  bounds,
  scale,
  onCommit,
  onSelect,
}: Args): DragInteraction {
  const [preview, setPreview] = useState<{ index: number; target: Target } | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const toTemplateCoords = useCallback(
    (e: React.PointerEvent): Point | null => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: (e.clientX - rect.left) * scale,
        y: (e.clientY - rect.top) * scale,
      };
    },
    [canvasRef, scale],
  );

  const beginDrag = useCallback(
    (e: React.PointerEvent, index: number, type: DragType, cornerIndex = 0) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(index);
      const pointer = toTemplateCoords(e);
      const base = targets[index];
      if (!pointer || !base) return;
      // Snapshot the target up front; for skew, materialize deltas now so the
      // baseline always matches what's rendered (no stale-state read).
      const startTarget: Target =
        type === "skew" && !base.deltas
          ? { ...base, deltas: zeroDeltas() }
          : base;
      dragRef.current = {
        type,
        index,
        cornerIndex,
        pointerId: e.pointerId,
        startPointer: pointer,
        startTarget,
      };
      canvasRef.current?.setPointerCapture(e.pointerId);
      setPreview({ index, target: startTarget });
    },
    [canvasRef, onSelect, targets, toTemplateCoords],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const pointer = toTemplateCoords(e);
      if (!pointer) return;
      const dx = pointer.x - drag.startPointer.x;
      const dy = pointer.y - drag.startPointer.y;
      const { startTarget } = drag;

      let next: Target;
      if (drag.type === "move") {
        next = {
          ...startTarget,
          topLeft: round(
            clampTopLeft(
              { x: startTarget.topLeft.x + dx, y: startTarget.topLeft.y + dy },
              startTarget.size,
              bounds,
            ),
          ),
        };
      } else if (drag.type === "resize") {
        next = {
          ...startTarget,
          size: round(
            clampSize(
              { x: startTarget.size.x + dx, y: startTarget.size.y + dy },
              startTarget.topLeft,
              bounds,
            ),
          ),
        };
      } else {
        const deltas = (startTarget.deltas ?? zeroDeltas()).map((d) => ({
          ...d,
        })) as Deltas;
        const di = POLY_TO_DELTA[drag.cornerIndex];
        deltas[di] = {
          x: Math.round(deltas[di].x + dx),
          y: Math.round(deltas[di].y + dy),
        };
        next = { ...startTarget, deltas };
      }
      setPreview({ index: drag.index, target: next });
    },
    [bounds, toTemplateCoords],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      canvasRef.current?.releasePointerCapture?.(drag.pointerId);
      if (preview && preview.index === drag.index) {
        onCommit(drag.index, preview.target);
      }
      dragRef.current = null;
      setPreview(null);
    },
    [canvasRef, onCommit, preview],
  );

  return { preview, beginDrag, handlePointerMove, handlePointerUp };
}
