import { useId, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { imageFileFromClipboard, readFileAsDataUrl } from "~/lib/clipboard";
import type { TargetInput } from "~/lib/schemas";

interface Props {
  target: TargetInput;
  index: number;
  label: string;
  onUpdate: (target: TargetInput) => void;
}

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const TargetInputView: React.FC<Props> = ({ target, index, label, onUpdate }) => {
  const fieldId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  const setMode = (kind: "image" | "text") => {
    if (kind === target.kind) return;
    if (kind === "image") onUpdate({ kind: "image", url: "", stretch: false });
    else onUpdate({ kind: "text", text: "", color: "#ea5a3d" });
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

  const handlePaste = (e: React.ClipboardEvent) => {
    const file = imageFileFromClipboard(e);
    if (!file) return;
    e.preventDefault();
    void handleFile(file);
  };

  return (
    <div className="rounded-xl border border-line bg-paper p-3" onPaste={handlePaste}>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-coral-500 text-[11px] font-bold text-white">
          {index + 1}
        </div>
        <span className="flex-1 truncate text-sm font-medium text-ink">{label}</span>
        <div
          className="inline-flex overflow-hidden rounded-full border border-line"
          role="group"
          aria-label="Input type"
        >
          {(["image", "text"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={target.kind === kind}
              onClick={() => setMode(kind)}
              className={`chip px-2.5 py-1 transition-colors ${
                target.kind === kind
                  ? "bg-coral-500 text-white"
                  : "bg-card text-slate hover:bg-paper hover:text-ink"
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
            className="field w-full px-2.5 py-1.5 text-sm"
            placeholder="https://… or paste an image"
            value={target.url.startsWith("data:") ? "" : target.url}
            onChange={(e) => onUpdate({ ...target, url: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="chip rounded-full border border-line px-3 py-1 text-slate transition-colors hover:border-coral-400 hover:text-ink"
            >
              Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label={`Upload image for ${label}`}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-slate">
              <input
                type="checkbox"
                checked={target.stretch}
                onChange={(e) => onUpdate({ ...target, stretch: e.target.checked })}
                className="accent-coral-500"
              />
              Stretch to fit
            </label>
          </div>
          {uploadError && <p className="text-xs text-red-700">{uploadError}</p>}
          {target.url && (
            <img
              src={target.url}
              alt={`Preview of ${label}`}
              className="h-16 rounded-lg object-contain ring-1 ring-line"
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
            className="field w-full px-2.5 py-1.5 text-sm"
            placeholder="Your text…"
            value={target.text}
            onChange={(e) => onUpdate({ ...target, text: e.target.value })}
          />
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              aria-label="Choose text color"
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen((o) => !o)}
              className="h-7 w-7 flex-shrink-0 rounded-full border border-line focus-visible:ring-2 focus-visible:ring-coral-500"
              style={{ backgroundColor: target.color }}
            />
            <label htmlFor={`${fieldId}-hex`} className="sr-only">
              Hex color for {label}
            </label>
            <input
              id={`${fieldId}-hex`}
              type="text"
              className="field w-24 px-2 py-1 font-mono text-xs"
              value={target.color}
              onChange={(e) => onUpdate({ ...target, color: e.target.value })}
            />
            {target.text && (
              <span className="truncate text-sm font-bold" style={{ color: target.color }}>
                {target.text}
              </span>
            )}
            {pickerOpen && (
              <div className="absolute left-0 top-9 z-20">
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
