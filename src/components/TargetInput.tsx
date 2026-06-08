import { useId, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import type { TargetInput } from "~/lib/schemas";

interface Props {
  target: TargetInput;
  index: number;
  label: string;
  onUpdate: (target: TargetInput) => void;
}

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

const TargetInputView: React.FC<Props> = ({ target, index, label, onUpdate }) => {
  const fieldId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  const setMode = (kind: "image" | "text") => {
    if (kind === target.kind) return;
    if (kind === "image") onUpdate({ kind: "image", url: "", stretch: false });
    else onUpdate({ kind: "text", text: "", color: "#9859e0" });
  };

  const handleFile = async (file: File | undefined) => {
    setUploadError(undefined);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("Image exceeds 25 MB limit");
      return;
    }
    try {
      const url = await readFileAsDataUrl(file);
      onUpdate({ kind: "image", url, stretch: target.kind === "image" ? target.stretch : false });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Could not read file");
    }
  };

  return (
    <div className="bg-gray-50 rounded p-3 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
        <span className="text-sm font-medium text-gray-700 flex-1 truncate">
          {label}
        </span>
        <div className="inline-flex rounded border border-gray-300 overflow-hidden" role="group" aria-label="Input type">
          {(["image", "text"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={target.kind === kind}
              onClick={() => setMode(kind)}
              className={`px-2 py-0.5 text-xs font-medium capitalize ${
                target.kind === kind
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {kind}
            </button>
          ))}
        </div>
      </div>

      {target.kind === "image" ? (
        <div className="space-y-2">
          <label htmlFor={`${fieldId}-url`} className="sr-only">
            Image URL for {label}
          </label>
          <input
            id={`${fieldId}-url`}
            type="url"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://... or data:image/..."
            value={target.url.startsWith("data:") ? "" : target.url}
            onChange={(e) => onUpdate({ ...target, url: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Upload…
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label={`Upload image for ${label}`}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={target.stretch}
                onChange={(e) => onUpdate({ ...target, stretch: e.target.checked })}
                className="rounded border-gray-300"
              />
              Stretch to fit
            </label>
          </div>
          {uploadError && (
            <p className="text-xs text-red-600">{uploadError}</p>
          )}
          {target.url && (
            <img
              src={target.url}
              alt={`Preview of ${label}`}
              className="h-16 object-contain rounded"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor={`${fieldId}-text`} className="sr-only">
            Text for {label}
          </label>
          <input
            id={`${fieldId}-text`}
            type="text"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="Text…"
            value={target.text}
            onChange={(e) => onUpdate({ ...target, text: e.target.value })}
          />
          <div className="flex items-center gap-2 relative">
            <button
              type="button"
              aria-label="Choose text color"
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen((o) => !o)}
              className="w-6 h-6 rounded border border-gray-300 flex-shrink-0 focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: target.color }}
            />
            <label htmlFor={`${fieldId}-hex`} className="sr-only">
              Hex color for {label}
            </label>
            <input
              id={`${fieldId}-hex`}
              type="text"
              className="w-24 px-2 py-1 text-xs font-mono border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              value={target.color}
              onChange={(e) => onUpdate({ ...target, color: e.target.value })}
            />
            {target.text && (
              <span className="font-bold text-sm truncate" style={{ color: target.color }}>
                {target.text}
              </span>
            )}
            {pickerOpen && (
              <div className="absolute top-8 left-0 z-10">
                <HexColorPicker
                  color={target.color}
                  onChange={(color) => onUpdate({ ...target, color })}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetInputView;
