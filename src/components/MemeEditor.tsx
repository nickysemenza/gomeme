import { useState, useRef, useEffect, useCallback } from "react";
import type { Target, Point } from "~/lib/schemas";
import { templates } from "~/lib/templates";
import {
  useTemplateEditor,
  fromTemplate,
  type DraftTemplate,
} from "~/hooks/useTemplateEditor";
import { useDragInteraction } from "~/hooks/useDragInteraction";
import Button from "./Button";
import EditorCanvas from "./editor/EditorCanvas";
import TargetsPanel from "./editor/TargetsPanel";
import YamlPanel from "./editor/YamlPanel";

const INITIAL: DraftTemplate = {
  name: "new_template",
  size: { x: 800, y: 600 },
  file: "",
  targets: [],
};

function makeTarget(n: number): Target {
  return {
    friendlyName: `Target ${n}`,
    topLeft: { x: 50, y: 50 },
    size: { x: 200, y: 100 },
  };
}

const MemeEditor: React.FC = () => {
  const editor = useTemplateEditor(INITIAL);
  const { template } = editor;

  const [selectedTarget, setSelectedTarget] = useState(-1);
  const [skewMode, setSkewMode] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [displaySize, setDisplaySize] = useState<Point>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // The displayed <img> preserves aspect ratio, so its element box equals the
  // contained image — a single uniform scale is correct for pointer math.
  const scale = displaySize.x > 0 ? template.size.x / displaySize.x : 1;

  const drag = useDragInteraction({
    canvasRef,
    targets: template.targets,
    bounds: template.size,
    scale,
    onCommit: editor.updateTarget,
    onSelect: setSelectedTarget,
  });

  const displayTargets = drag.preview
    ? template.targets.map((t, i) =>
        i === drag.preview!.index ? drag.preview!.target : t,
      )
    : template.targets;

  const loadPreset = (name: string) => {
    const preset = templates[name];
    if (!preset) return;
    editor.load(fromTemplate(preset));
    setImageUrl(preset.file);
    setImageLoaded(false);
    setImageError(false);
    setSelectedTarget(-1);
    setSkewMode(preset.targets.some((t) => t.deltas != null));
  };

  const handleImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.target as HTMLImageElement;
      editor.setSize({ x: img.naturalWidth, y: img.naturalHeight });
      setDisplaySize({ x: img.clientWidth, y: img.clientHeight });
      setImageLoaded(true);
      setImageError(false);
    },
    [editor],
  );

  const addTarget = () => {
    editor.addTarget(makeTarget(template.targets.length + 1));
    setSelectedTarget(template.targets.length);
  };

  const removeTarget = (index: number) => {
    editor.removeTarget(index);
    setSelectedTarget(-1);
  };

  // Keyboard undo/redo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) editor.redo();
      else editor.undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor]);

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
        <div className="lg:col-span-1 space-y-6">
          {/* Presets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Presets</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(templates).map((name) => (
                <Button key={name} onClick={() => loadPreset(name)} size="sm" variant="secondary">
                  {name}
                </Button>
              ))}
            </div>
          </div>

          {/* Template settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Settings</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="tpl-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  id="tpl-name"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={template.name}
                  onChange={(e) => editor.setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="tpl-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  id="tpl-url"
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageError(false);
                  }}
                />
              </div>
              <div>
                <label htmlFor="tpl-file" className="block text-sm font-medium text-gray-700 mb-2">
                  File Path
                </label>
                <input
                  id="tpl-file"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="templates/image.jpg"
                  value={template.file}
                  onChange={(e) => editor.setFile(e.target.value)}
                />
              </div>
            </div>
          </div>

          <TargetsPanel
            targets={template.targets}
            selectedIndex={selectedTarget}
            onSelect={setSelectedTarget}
            onAdd={addTarget}
            onRemove={removeTarget}
            onUpdate={editor.updateTarget}
          />

          <YamlPanel
            current={template}
            hasTargets={template.targets.length > 0}
            onLoadTemplate={(t) => {
              editor.load(fromTemplate(t));
              setImageUrl(t.file);
              setImageLoaded(false);
              setImageError(false);
              setSelectedTarget(-1);
              setSkewMode(t.targets.some((target) => target.deltas != null));
            }}
          />
        </div>

        {/* Visual editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Visual Editor</h3>
              <div className="flex items-center gap-3">
                <Button onClick={editor.undo} disabled={!editor.canUndo} size="sm" variant="secondary">
                  Undo
                </Button>
                <Button onClick={editor.redo} disabled={!editor.canRedo} size="sm" variant="secondary">
                  Redo
                </Button>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={skewMode}
                    onChange={(e) => setSkewMode(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Skew
                </label>
              </div>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 relative inline-block">
              <EditorCanvas
                canvasRef={canvasRef}
                imageUrl={imageUrl}
                imageLoaded={imageLoaded}
                imageError={imageError}
                onImageLoad={handleImageLoad}
                onImageError={() => {
                  setImageLoaded(false);
                  setImageError(true);
                }}
                templateSize={template.size}
                targets={displayTargets}
                selectedIndex={selectedTarget}
                skewMode={skewMode}
                scale={scale}
                drag={drag}
                onSelect={setSelectedTarget}
              />
            </div>
            {imageLoaded && !imageError && (
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

export default MemeEditor;
