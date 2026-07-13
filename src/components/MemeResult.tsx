import type {
  MemeResult as MemeResultType,
  OpLogEntry,
} from "~/lib/meme-generator";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  result?: MemeResultType;
  loading: boolean;
  debug: boolean;
}

const MemeResult: React.FC<Props> = ({ result, loading, debug }) => {
  if (loading && !result) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center gap-3 rounded-lg border border-dashed border-line">
        <LoadingSpinner size="md" />
        <span className="text-sm text-muted">Rendering…</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center rounded-lg border border-dashed border-line">
        <span className="text-sm text-muted">Your meme will render here.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <img
        src={result.imageUrl}
        alt="Generated meme"
        className="w-full rounded-lg ring-1 ring-line"
      />

      {debug && result.opLog.length > 0 && (
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {result.opLog.map((entry, idx) => (
            <div
              key={idx}
              className="rounded bg-well px-2 py-1 font-mono text-xs"
            >
              <span className="text-muted">#{entry.step}</span>{" "}
              <span className="font-semibold text-ink">{entry.op}</span>{" "}
              <span className="text-muted">{entry.duration}</span>
              {entry.args.length > 0 && (
                <span className="ml-1 text-muted">{entry.args.join(" ")}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemeResult;
