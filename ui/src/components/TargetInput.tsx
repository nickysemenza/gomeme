import React from "react";
import { HexColorPicker } from "react-colorful";
import type { ImageInput, TextInput } from "../gen/meme_pb";

interface TargetForm {
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
        image: { URL: value, stretch: target.image?.stretch ?? false } as ImageInput,
        kind: "image",
      });
    } else {
      onUpdate({
        text: { Text: value, Color: target.text?.Color || "#9859e0" } as TextInput,
        kind: "text",
      });
    }
  };

  const handleColorChange = (color: string) => {
    if (target.text) {
      onUpdate({
        ...target,
        text: { ...target.text, Color: color } as TextInput,
      });
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
          {index + 1}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Input {index + 1}</h3>
        <div className="ml-auto">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              target.kind === "image"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {target.kind === "image" ? "🖼️ Image" : "📝 Text"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {target.kind === "image" ? "Image URL or Base64" : "Text Content"}
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder={
              target.kind === "image"
                ? "https://... or data:image/..."
                : "Enter text here..."
            }
            value={target.text?.Text || target.image?.URL || ""}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        </div>

        {/* Content Preview/Editor */}
        <div>
          {target.text && (
            <TextPreview text={target.text} onColorChange={handleColorChange} />
          )}

          {target.image && <ImagePreview image={target.image} />}
        </div>
      </div>
    </div>
  );
};

interface TextPreviewProps {
  text: TextInput;
  onColorChange: (color: string) => void;
}

const TextPreview: React.FC<TextPreviewProps> = ({ text, onColorChange }) => (
  <div className="space-y-3">
    <label className="block text-sm font-medium text-gray-700">Text Color</label>
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="w-full h-full" style={{ backgroundColor: text.Color }} />
      </div>
      <div className="flex-1">
        <HexColorPicker color={text.Color} onChange={onColorChange} />
      </div>
    </div>
    {text.Text && (
      <div className="mt-3 p-3 bg-white rounded-lg border">
        <p className="text-sm text-gray-600 mb-1">Preview:</p>
        <span className="font-bold text-lg" style={{ color: text.Color }}>
          {text.Text}
        </span>
      </div>
    )}
  </div>
);

interface ImagePreviewProps {
  image: ImageInput;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Image Preview
    </label>
    <div className="w-full max-w-xs mx-auto bg-white rounded-lg border p-2">
      <img
        src={image.URL}
        alt="Input preview"
        className="w-full h-40 object-contain rounded"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  </div>
);

export default TargetInput;
export type { TargetForm };
