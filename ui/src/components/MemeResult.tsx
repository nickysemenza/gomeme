import React from "react";
import { Meme, OperationMap, Operation } from "../proto/meme_pb";
import { LoadingState } from "./LoadingSpinner";

interface Props {
  meme?: Meme;
  loading: boolean;
  debug: boolean;
}

const MemeResult: React.FC<Props> = ({ meme, loading, debug }) => {
  if (loading && !meme) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <LoadingState 
          title="Creating Your Meme" 
          message="This may take a few seconds..." 
        />
      </div>
    );
  }

  if (!meme && !loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🎨</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Create</h3>
        <p className="text-gray-600">Fill in the inputs above and click "Generate Meme"</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generated Meme */}
      {meme && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🎭</span>
            Generated Meme
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <img
              src={meme.getUrl()}
              alt="Generated meme"
              className="w-full max-w-sm mx-auto rounded-lg shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Debug Information */}
      {meme && debug && meme.getOplogList().length > 0 && (
        <DebugPanel meme={meme} />
      )}
    </div>
  );
};

interface DebugPanelProps {
  meme: Meme;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ meme }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <span className="mr-2">🔧</span>
      Processing Steps
    </h3>
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {meme.getOplogList().map((operation, idx) => (
        <ProcessingStep key={idx} operation={operation} />
      ))}
    </div>
  </div>
);

interface ProcessingStepProps {
  operation: any; // OpLog type from proto
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({ operation }) => (
  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <img
          src={operation.getFile()}
          className="w-16 h-16 object-cover rounded-lg"
          alt={getOpName(operation.getOp())}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Step {operation.getStep()}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {getOpName(operation.getOp())}
          </span>
          <span className="text-xs text-gray-500">
            {operation.getDuration()}
          </span>
        </div>
        {operation.getArgsList().length > 0 && (
          <p className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded">
            {operation.getArgsList().join(", ")}
          </p>
        )}
      </div>
    </div>
  </div>
);

const getOpName = (op: OperationMap[keyof OperationMap]) => {
  switch (op) {
    case Operation.SHRINK:
      return "shrink";
    case Operation.COMPOSITE:
      return "composite";
    case Operation.DISTORT:
      return "distort";
    case Operation.RECT:
      return "rectangle (debug)";
    case Operation.TEXT:
      return "text";
    default:
      return "unknown";
  }
};

export default MemeResult;