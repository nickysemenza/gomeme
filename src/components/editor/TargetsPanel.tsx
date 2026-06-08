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
      <label htmlFor={id} className="chip block text-mist">
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(toInt(e.target.value, value, min))}
        className="field mt-1 w-full px-1.5 py-1 text-xs"
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
  <div className="surface p-6">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="chip text-slate">targets</h3>
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
            className={`rounded-xl border p-3 transition-colors ${
              selected
                ? "border-coral-500/40 bg-coral-500/[0.07]"
                : "border-line bg-paper"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                aria-pressed={selected}
                aria-label={`Select ${target.friendlyName}`}
                onClick={() => onSelect(index)}
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  selected ? "bg-coral-500 text-white" : "bg-line text-slate hover:bg-mist/40"
                }`}
              >
                {index + 1}
              </button>
              <input
                type="text"
                aria-label={`Name for target ${index + 1}`}
                className="flex-1 border-b border-transparent bg-transparent font-medium text-ink outline-none focus:border-line"
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
                className="rounded px-1 text-sm text-mist transition-colors hover:text-coral-600"
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
        <li className="py-8 text-center text-sm text-mist">
          <p>No targets yet. Click "+ Add" to start.</p>
        </li>
      )}
    </ul>
  </div>
);

export default TargetsPanel;
