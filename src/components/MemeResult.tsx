import type { MemeResult as MemeResultType, OpLogEntry } from "~/lib/meme-generator";
import { LoadingState } from "./LoadingSpinner";

interface Props {
  result?: MemeResultType;
  loading: boolean;
  debug: boolean;
}

const MemeResult: React.FC<Props> = ({ result, loading, debug }) => {
  if (loading && !result) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <LoadingState
          title="Creating Your Meme"
          message="Processing in your browser..."
        />
      </div>
    );
  }

  if (!result && !loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🎨</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ready to Create
        </h3>
        <p className="text-gray-600">
          Fill in the inputs above and click "Generate Meme"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {result && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🎭</span>
            Generated Meme
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <img
              src={result.imageUrl}
              alt="Generated meme"
              className="w-full max-w-sm mx-auto rounded-lg shadow-sm"
            />
          </div>
        </div>
      )}

      {result && debug && result.opLog.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔧</span>
            Processing Steps
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {result.opLog.map((entry, idx) => (
              <ProcessingStep key={idx} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProcessingStep: React.FC<{ entry: OpLogEntry }> = ({ entry }) => (
  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
    <div className="flex items-center space-x-2 mb-1">
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Step {entry.step}
      </span>
      <span className="text-sm font-medium text-gray-900">{entry.op}</span>
      <span className="text-xs text-gray-500">{entry.duration}</span>
    </div>
    {entry.args.length > 0 && (
      <p className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded">
        {entry.args.join(", ")}
      </p>
    )}
  </div>
);

export default MemeResult;
