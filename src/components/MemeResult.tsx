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
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-sm text-gray-500">Generating...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        Hit generate to create a meme
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <img
        src={result.imageUrl}
        alt="Generated meme"
        className="w-full rounded shadow-sm"
      />

      {debug && result.opLog.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {result.opLog.map((entry, idx) => (
            <div
              key={idx}
              className="text-xs font-mono bg-gray-50 rounded px-2 py-1 border-l-2 border-blue-400"
            >
              <span className="text-gray-400">#{entry.step}</span>{" "}
              <span className="font-semibold">{entry.op}</span>{" "}
              <span className="text-gray-500">{entry.duration}</span>
              {entry.args.length > 0 && (
                <span className="text-gray-400 ml-1">
                  {entry.args.join(" ")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemeResult;
