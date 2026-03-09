import { HexColorPicker } from "react-colorful";
import type { ImageInput, TextInput } from "~/lib/schemas";

export interface TargetForm {
  image?: ImageInput;
  text?: TextInput;
  kind: "image" | "text";
}

interface Props {
  target: TargetForm;
  index: number;
  onUpdate: (target: TargetForm) => void;
}

const TargetInput: React.FC<Props> = ({ target, index, onUpdate }) => {
  const handleInputChange = (value: string) => {
    const isImage = value.startsWith("http") || value.startsWith("data:image");

    if (isImage) {
      onUpdate({
        image: {
          kind: "image",
          url: value,
          stretch: target.image?.stretch ?? false,
        },
        kind: "image",
      });
    } else {
      onUpdate({
        text: {
          kind: "text",
          text: value,
          color: target.text?.color || "#9859e0",
        },
        kind: "text",
      });
    }
  };

  const handleColorChange = (color: string) => {
    if (target.text) {
      onUpdate({
        ...target,
        text: { ...target.text, color },
      });
    }
  };

  return (
    <div className="bg-gray-50 rounded p-3 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
        <span
          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            target.kind === "image"
              ? "bg-blue-100 text-blue-700"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {target.kind}
        </span>
      </div>

      <input
        type="text"
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        placeholder={
          target.kind === "image" ? "https://... or data:image/..." : "Text..."
        }
        value={target.text?.text || target.image?.url || ""}
        onChange={(e) => handleInputChange(e.target.value)}
      />

      {target.text && (
        <div className="mt-2 flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-gray-300 flex-shrink-0 cursor-pointer relative group"
            style={{ backgroundColor: target.text.color }}
          >
            <div className="absolute top-7 left-0 z-10 hidden group-hover:block">
              <HexColorPicker
                color={target.text.color}
                onChange={handleColorChange}
              />
            </div>
          </div>
          <span
            className="font-bold text-sm truncate"
            style={{ color: target.text.color }}
          >
            {target.text.text}
          </span>
        </div>
      )}

      {target.image && target.image.url && (
        <img
          src={target.image.url}
          alt="preview"
          className="mt-2 h-16 object-contain rounded"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
};

export default TargetInput;
