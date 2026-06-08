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
      <div className="flex h-full min-h-32 items-center justify-center gap-3 rounded-xl border border-dashed border-line">
        <LoadingSpinner size="md" />
        <span className="chip text-slate">Rendering…</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center rounded-xl border border-dashed border-line">
        <span className="chip text-mist">Hit generate →</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <img
        src={result.imageUrl}
        alt="Generated meme"
        className="w-full rounded-xl ring-1 ring-line"
      />

      {debug && result.opLog.length > 0 && (
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {result.opLog.map((entry, idx) => (
            <div
              key={idx}
              className="rounded-md border-l-2 border-coral-400 bg-paper px-2 py-1 font-mono text-xs"
            >
              <span className="text-mist">#{entry.step}</span>{" "}
              <span className="font-semibold text-coral-700">{entry.op}</span>{" "}
              <span className="text-slate">{entry.duration}</span>
              {entry.args.length > 0 && (
                <span className="ml-1 text-mist">{entry.args.join(" ")}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemeResult;
