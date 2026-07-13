import type { RefObject } from "react";
import type { Target, Size } from "~/lib/schemas";
import { getTargetPolygon } from "~/lib/geometry";
import type { DragInteraction } from "~/hooks/useDragInteraction";

interface Props {
  canvasRef: RefObject<HTMLDivElement | null>;
  imageUrl: string;
  imageLoaded: boolean;
  imageError: boolean;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onImageError: () => void;
  templateSize: Size;
  targets: Target[];
  selectedIndex: number;
  skewMode: boolean;
  scale: number;
  drag: DragInteraction;
  onSelect: (index: number) => void;
}

interface LabelLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

function computeLabelLayout(anchor: { x: number; y: number }, name: string, scale: number): LabelLayout {
  const height = 20 * scale;
  const width = name.length * 9 * scale;
  const above = anchor.y - height - 4 * scale >= 0;
  return {
    x: anchor.x,
    y: above ? anchor.y - height - 4 * scale : anchor.y + 4 * scale,
    width,
    height,
  };
}

const EditorCanvas: React.FC<Props> = ({
  canvasRef,
  imageUrl,
  imageLoaded,
  imageError,
  onImageLoad,
  onImageError,
  templateSize,
  targets,
  selectedIndex,
  skewMode,
  scale,
  drag,
  onSelect,
}) => {
  if (!imageUrl) {
    return (
      <div className="flex h-64 w-full items-center justify-center px-6 text-center">
        <p className="text-sm text-muted">Enter an image URL or load a preset.</p>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className="relative cursor-crosshair touch-none"
      onPointerMove={drag.handlePointerMove}
      onPointerUp={drag.handlePointerUp}
      onPointerCancel={drag.handlePointerUp}
    >
      <img
        src={imageUrl}
        alt="Template being edited"
        onLoad={onImageLoad}
        onError={onImageError}
        className="block max-w-full max-h-96 object-contain"
        draggable={false}
      />

      {imageError && (
        <div
          role="alert"
          className="absolute inset-0 flex items-center justify-center bg-bg/90 p-4 text-center text-sm text-red-700"
        >
          Could not load this image. Check the URL or file path.
        </div>
      )}

      {imageLoaded && !imageError && templateSize.x > 0 && (
        <svg
          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
          viewBox={`0 0 ${templateSize.x} ${templateSize.y}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {targets.map((target, index) => {
            const pts = getTargetPolygon(target.topLeft, target.size, target.deltas);
            const pointsStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
            const isSelected = selectedIndex === index;
            // Both target colors are saturated, so white label text reads on either.
            const targetColor = isSelected ? "stroke-primary" : "stroke-accent";
            const targetFill = isSelected ? "fill-primary/15" : "fill-accent/15";
            const labelFill = isSelected ? "fill-primary" : "fill-accent";
            const label = computeLabelLayout(pts[0], target.friendlyName, scale);

            return (
              <g key={index}>
                <polygon
                  points={pointsStr}
                  strokeWidth={3 * scale}
                  className={`cursor-move ${targetFill} ${targetColor}`}
                  onPointerDown={(e) => drag.beginDrag(e, index, "move")}
                />
                <rect
                  x={label.x}
                  y={label.y}
                  width={label.width}
                  height={label.height}
                  rx={4 * scale}
                  className={labelFill}
                  style={{ pointerEvents: "none" }}
                />
                <text
                  x={label.x + 6 * scale}
                  y={label.y + 15 * scale}
                  fontSize={13 * scale}
                  fontWeight="600"
                  className="fill-white"
                  style={{ pointerEvents: "none" }}
                >
                  {target.friendlyName}
                </text>

                {/* Resize handle at the bottom-right corner (render index 2). */}
                {isSelected && !skewMode && (
                  <rect
                    x={pts[2].x - 7 * scale}
                    y={pts[2].y - 7 * scale}
                    width={14 * scale}
                    height={14 * scale}
                    strokeWidth={2 * scale}
                    className="cursor-nwse-resize fill-primary stroke-white"
                    onPointerDown={(e) => drag.beginDrag(e, index, "resize")}
                  />
                )}

                {/* Corner handles for skew adjustment. */}
                {isSelected &&
                  skewMode &&
                  pts.map((pt, ci) => (
                    <circle
                      key={ci}
                      cx={pt.x}
                      cy={pt.y}
                      r={7 * scale}
                      strokeWidth={2 * scale}
                      className="cursor-grab fill-primary stroke-white"
                      onPointerDown={(e) => drag.beginDrag(e, index, "skew", ci)}
                    />
                  ))}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};

export default EditorCanvas;
