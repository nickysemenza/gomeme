import { useId } from "react";
import type { Target } from "~/lib/schemas";
import Button from "../Button";

interface Props {
  targets: Target[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, target: Target) => void;
}

function toInt(value: string, fallback: number, min: number): number {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, n);
}

interface NumberFieldProps {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}

const NumberField: React.FC<NumberFieldProps> = ({ label, value, min, onChange }) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] text-gray-500">
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(toInt(e.target.value, value, min))}
        className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
};

const TargetsPanel: React.FC<Props> = ({
  targets,
  selectedIndex,
  onSelect,
  onAdd,
  onRemove,
  onUpdate,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Targets</h3>
      <Button onClick={onAdd} size="sm" variant="secondary">
        + Add
      </Button>
    </div>

    <ul className="space-y-3">
      {targets.map((target, index) => {
        const selected = selectedIndex === index;
        return (
          <li
            key={index}
            className={`p-3 rounded-lg border transition-colors ${
              selected ? "border-blue-500 bg-blue-50" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                aria-pressed={selected}
                aria-label={`Select ${target.friendlyName}`}
                onClick={() => onSelect(index)}
                className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold focus:ring-2 focus:ring-blue-500"
              >
                {index + 1}
              </button>
              <input
                type="text"
                aria-label={`Name for target ${index + 1}`}
                className="font-medium bg-transparent border-b border-transparent focus:border-gray-300 outline-none flex-1"
                value={target.friendlyName}
                onFocus={() => onSelect(index)}
                onChange={(e) =>
                  onUpdate(index, { ...target, friendlyName: e.target.value })
                }
              />
              <button
                type="button"
                aria-label={`Remove ${target.friendlyName}`}
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 text-sm focus:ring-2 focus:ring-red-500 rounded px-1"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2" onFocus={() => onSelect(index)}>
              <NumberField
                label="X"
                min={0}
                value={target.topLeft.x}
                onChange={(x) => onUpdate(index, { ...target, topLeft: { ...target.topLeft, x } })}
              />
              <NumberField
                label="Y"
                min={0}
                value={target.topLeft.y}
                onChange={(y) => onUpdate(index, { ...target, topLeft: { ...target.topLeft, y } })}
              />
              <NumberField
                label="W"
                min={1}
                value={target.size.x}
                onChange={(x) => onUpdate(index, { ...target, size: { ...target.size, x } })}
              />
              <NumberField
                label="H"
                min={1}
                value={target.size.y}
                onChange={(y) => onUpdate(index, { ...target, size: { ...target.size, y } })}
              />
            </div>
          </li>
        );
      })}
      {targets.length === 0 && (
        <li className="text-center py-8 text-gray-500">
          <p>No targets yet. Click "+ Add" to start.</p>
        </li>
      )}
    </ul>
  </div>
);

export default TargetsPanel;
