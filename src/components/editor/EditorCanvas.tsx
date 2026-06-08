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
      <div className="w-full h-64 flex items-center justify-center text-gray-500">
        <p>Enter an image URL or load a preset to start editing</p>
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
          className="absolute inset-0 flex items-center justify-center bg-white/80 text-red-700 text-sm p-4 text-center"
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
            const color = isSelected ? "#3b82f6" : "#ef4444";
            const label = computeLabelLayout(pts[0], target.friendlyName, scale);

            return (
              <g key={index}>
                <polygon
                  points={pointsStr}
                  fill={isSelected ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)"}
                  stroke={color}
                  strokeWidth={3 * scale}
                  className="cursor-move"
                  onPointerDown={(e) => drag.beginDrag(e, index, "move")}
                />
                <rect
                  x={label.x}
                  y={label.y}
                  width={label.width}
                  height={label.height}
                  rx={4 * scale}
                  fill={color}
                  style={{ pointerEvents: "none" }}
                />
                <text
                  x={label.x + 6 * scale}
                  y={label.y + 15 * scale}
                  fontSize={13 * scale}
                  fontWeight="500"
                  fill="white"
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
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth={2 * scale}
                    className="cursor-nwse-resize"
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
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth={2 * scale}
                      className="cursor-grab"
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
