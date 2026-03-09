import { useState, useRef, useCallback } from "react";
import * as yaml from "js-yaml";
import Button from "./Button";

interface Point {
  x: number;
  y: number;
}

interface EditorTarget {
  friendly_name: string;
  top_left: Point;
  size: Point;
  deltas?: Point[];
}

interface EditorTemplate {
  name: string;
  size: Point;
  targets: EditorTarget[];
  file: string;
}

interface DragState {
  isDragging: boolean;
  dragType: "move" | "resize";
  targetIndex: number;
  startPos: Point;
  startSize: Point;
  startTopLeft: Point;
}

const MemeEditor: React.FC = () => {
  const [template, setTemplate] = useState<EditorTemplate>({
    name: "new_template",
    size: { x: 800, y: 600 },
    targets: [],
    file: "",
  });

  const [selectedTarget, setSelectedTarget] = useState<number>(-1);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [yamlInput, setYamlInput] = useState<string>("");
  const [existingTemplates, setExistingTemplates] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const loadSampleTemplate = () => {
    setTemplate({
      name: "drake_sample",
      size: { x: 425, y: 365 },
      targets: [
        {
          friendly_name: "panel 1",
          top_left: { x: 217, y: 0 },
          size: { x: 210, y: 170 },
        },
        {
          friendly_name: "panel 2",
          top_left: { x: 217, y: 174 },
          size: { x: 210, y: 170 },
        },
      ],
      file: "templates/drake1.jpeg",
    });
    setImageUrl("/templates/drake1.jpeg");
    setSelectedTarget(-1);
  };

  const handleImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.target as HTMLImageElement;
      setTemplate((prev) => ({
        ...prev,
        size: { x: img.naturalWidth, y: img.naturalHeight },
      }));
      setImageLoaded(true);
    },
    [],
  );

  const addTarget = () => {
    const newTarget: EditorTarget = {
      friendly_name: `Target ${template.targets.length + 1}`,
      top_left: { x: 50, y: 50 },
      size: { x: 200, y: 100 },
    };
    setTemplate((prev) => ({
      ...prev,
      targets: [...prev.targets, newTarget],
    }));
    setSelectedTarget(template.targets.length);
  };

  const updateTarget = useCallback(
    (index: number, updates: Partial<EditorTarget>) => {
      setTemplate((prev) => ({
        ...prev,
        targets: prev.targets.map((target, i) =>
          i === index ? { ...target, ...updates } : target,
        ),
      }));
    },
    [],
  );

  const removeTarget = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      targets: prev.targets.filter((_, i) => i !== index),
    }));
    setSelectedTarget(-1);
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    targetIndex: number,
    dragType: "move" | "resize",
  ) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const target = template.targets[targetIndex];
    setDragState({
      isDragging: true,
      dragType,
      targetIndex,
      startPos: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      startSize: { ...target.size },
      startTopLeft: { ...target.top_left },
    });
    setSelectedTarget(targetIndex);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const currentPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      const deltaX = currentPos.x - dragState.startPos.x;
      const deltaY = currentPos.y - dragState.startPos.y;

      if (dragState.dragType === "move") {
        updateTarget(dragState.targetIndex, {
          top_left: {
            x: Math.max(
              0,
              Math.min(
                template.size.x - dragState.startSize.x,
                dragState.startTopLeft.x + deltaX,
              ),
            ),
            y: Math.max(
              0,
              Math.min(
                template.size.y - dragState.startSize.y,
                dragState.startTopLeft.y + deltaY,
              ),
            ),
          },
        });
      } else if (dragState.dragType === "resize") {
        const newWidth = Math.max(20, dragState.startSize.x + deltaX);
        const newHeight = Math.max(20, dragState.startSize.y + deltaY);
        updateTarget(dragState.targetIndex, {
          size: {
            x: Math.min(
              newWidth,
              template.size.x - dragState.startTopLeft.x,
            ),
            y: Math.min(
              newHeight,
              template.size.y - dragState.startTopLeft.y,
            ),
          },
        });
      }
    },
    [dragState, template.size, updateTarget],
  );

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const generateYAML = () => {
    const yamlData = {
      [template.name]: {
        size: template.size,
        targets: template.targets.map((target) => ({
          friendly_name: target.friendly_name,
          top_left: target.top_left,
          size: target.size,
          ...(target.deltas &&
            target.deltas.length > 0 && { deltas: target.deltas }),
        })),
        file: template.file,
      },
    };

    try {
      return yaml.dump(yamlData, {
        indent: 2,
        lineWidth: -1,
        quotingType: '"',
        forceQuotes: false,
      });
    } catch {
      return "Error generating YAML.";
    }
  };

  const extractTemplateNames = (yamlText: string) => {
    try {
      const parsed = yaml.load(yamlText) as Record<string, unknown>;
      if (!parsed) return [];
      if (
        parsed.templates &&
        typeof parsed.templates === "object" &&
        parsed.templates !== null
      ) {
        return Object.keys(parsed.templates as object);
      }
      return Object.keys(parsed).filter((key) => {
        const val = parsed[key];
        return (
          val &&
          typeof val === "object" &&
          val !== null &&
          ("size" in val || "targets" in val)
        );
      });
    } catch {
      return [];
    }
  };

  const loadTemplateFromYAML = (templateName: string) => {
    try {
      const parsed = yaml.load(yamlInput) as Record<string, unknown>;
      if (!parsed) return;

      const templateData =
        (parsed[templateName] as Record<string, unknown>) ||
        ((parsed.templates as Record<string, unknown> | undefined)?.[
          templateName
        ] as Record<string, unknown>);

      if (!templateData) return;

      setTemplate({
        name: templateName,
        size: (templateData.size as Point) || { x: 800, y: 600 },
        targets: ((templateData.targets as EditorTarget[]) || []).map(
          (t: EditorTarget) => ({
            friendly_name: t.friendly_name || "Unnamed Target",
            top_left: t.top_left || { x: 0, y: 0 },
            size: t.size || { x: 100, y: 100 },
            ...(t.deltas && { deltas: t.deltas }),
          }),
        ),
        file: (templateData.file as string) || "",
      });
      setSelectedTarget(-1);
      setImageUrl("");
    } catch {
      // ignore parse errors
    }
  };

  const handleYAMLImport = () => {
    setExistingTemplates(extractTemplateNames(yamlInput));
  };

  const loadSampleYAML = () => {
    const sampleYAML = `templates:
  office1:
    size:
      x: 1363
      y: 1524
    targets:
      - friendly_name: panel 1
        top_left:
          x: 19
          y: 42
        size:
          x: 709
          y: 505
        deltas:
          - x: 195
            y: 0
          - x: 0
            y: -98
          - x: 0
            y: 46
          - x: -173
            y: 0
      - friendly_name: panel 2
        top_left:
          x: 628
          y: 112
        size:
          x: 954
          y: 553
    file: templates/office1.jpg
  drake1:
    size:
      x: 425
      y: 365
    targets:
      - friendly_name: panel 1
        top_left:
          x: 217
          y: 0
        size:
          x: 210
          y: 170
      - friendly_name: panel 2
        top_left:
          x: 217
          y: 174
        size:
          x: 210
          y: 170
    file: templates/drake1.jpeg`;

    setYamlInput(sampleYAML);
    setExistingTemplates(extractTemplateNames(sampleYAML));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Meme Template Editor
        </h1>
        <p className="text-lg text-gray-600">
          Create and edit meme templates visually, then export to YAML
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Template Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={template.name}
                  onChange={(e) =>
                    setTemplate({ ...template, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Path
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="templates/image.jpg"
                  value={template.file}
                  onChange={(e) =>
                    setTemplate({ ...template, file: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* YAML Import */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Import Template
            </h3>
            <div className="space-y-4">
              <Button
                onClick={loadSampleYAML}
                size="sm"
                variant="secondary"
              >
                Load Sample YAML
              </Button>
              <textarea
                className="w-full h-32 px-3 py-2 text-sm font-mono bg-gray-50 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste YAML here..."
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
              />
              <Button
                onClick={handleYAMLImport}
                disabled={!yamlInput.trim()}
                size="sm"
                variant="secondary"
              >
                Parse Templates
              </Button>
              {existingTemplates.length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                  {existingTemplates.map((name) => (
                    <button
                      key={name}
                      onClick={() => loadTemplateFromYAML(name)}
                      className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors font-medium text-gray-900"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Targets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Targets</h3>
              <div className="flex space-x-2">
                <Button onClick={addTarget} size="sm" variant="secondary">
                  + Add
                </Button>
                <Button
                  onClick={loadSampleTemplate}
                  size="sm"
                  variant="secondary"
                >
                  Sample
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {template.targets.map((target, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTarget === index
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedTarget(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      className="font-medium bg-transparent border-none outline-none flex-1"
                      value={target.friendly_name}
                      onChange={(e) =>
                        updateTarget(index, {
                          friendly_name: e.target.value,
                        })
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTarget(index);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      x
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                    <div>
                      Pos: {target.top_left.x}, {target.top_left.y}
                    </div>
                    <div>
                      Size: {target.size.x} x {target.size.y}
                    </div>
                  </div>
                </div>
              ))}
              {template.targets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No targets yet. Click "+ Add" to start.</p>
                </div>
              )}
            </div>
          </div>

          {/* YAML Export */}
          <YAMLExport generateYAML={generateYAML} hasTargets={template.targets.length > 0} />
        </div>

        {/* Visual Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Visual Editor
            </h3>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 relative inline-block">
              {imageUrl ? (
                <div
                  ref={canvasRef}
                  className="relative cursor-crosshair"
                  onMouseMove={dragState ? handleMouseMove : undefined}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    src={imageUrl}
                    alt="Template"
                    onLoad={handleImageLoad}
                    onError={() => setImageLoaded(false)}
                    className="block max-w-full max-h-96 object-contain"
                    draggable={false}
                  />
                  {imageLoaded &&
                    template.targets.map((target, index) => (
                      <div
                        key={index}
                        className={`absolute border-2 ${
                          selectedTarget === index
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-red-500 bg-red-500/10"
                        } cursor-move`}
                        style={{
                          left: target.top_left.x,
                          top: target.top_left.y,
                          width: target.size.x,
                          height: target.size.y,
                        }}
                        onClick={() => setSelectedTarget(index)}
                        onMouseDown={(e) => handleMouseDown(e, index, "move")}
                      >
                        <div
                          className={`absolute -top-6 left-0 px-2 py-1 text-xs font-medium rounded ${
                            selectedTarget === index
                              ? "bg-blue-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {target.friendly_name}
                        </div>
                        {selectedTarget === index && (
                          <div
                            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleMouseDown(e, index, "resize");
                            }}
                          />
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-gray-500">
                  <p>Enter an image URL above to start editing</p>
                </div>
              )}
            </div>
            {imageLoaded && (
              <div className="mt-4 text-sm text-gray-600">
                Template Size: {template.size.x} x {template.size.y}px
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const YAMLExport: React.FC<{
  generateYAML: () => string;
  hasTargets: boolean;
}> = ({ generateYAML, hasTargets }) => {
  const [yamlText, setYamlText] = useState("");
  const [showYAML, setShowYAML] = useState(false);

  const handleExport = () => {
    setYamlText(generateYAML());
    setShowYAML(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export</h3>
      <div className="space-y-3">
        <Button onClick={handleExport} disabled={!hasTargets}>
          Generate YAML
        </Button>
        {showYAML && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                YAML Output:
              </span>
              <Button
                onClick={() => navigator.clipboard.writeText(yamlText)}
                size="sm"
                variant="secondary"
              >
                Copy
              </Button>
            </div>
            <textarea
              className="w-full h-40 px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-lg resize-none"
              value={yamlText}
              readOnly
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MemeEditor;
