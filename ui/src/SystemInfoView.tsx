import React from "react";
import { useQuery } from "@tanstack/react-query";
import { memeClient } from "./connect";
import ReactJson from "react-json-view";

const SystemInfoView: React.FC = () => {
  const { data: info, isLoading } = useQuery({
    queryKey: ["systemInfo"],
    queryFn: () => memeClient.getInfo({}),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            System Information
          </h1>
          <p className="text-lg text-gray-600">
            Technical details about the GoMeme server
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {info ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    System Details
                  </h2>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                    <ReactJson
                      src={info as object}
                      theme="monokai"
                      displayDataTypes={false}
                      displayObjectSize={false}
                      enableClipboard={true}
                    />
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Loading System Info
                </h3>
                <p className="text-gray-600">Fetching server information...</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Failed to Load
                </h3>
                <p className="text-gray-600">Could not fetch system information</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← Back to Meme Generator
          </a>
        </div>
      </div>
    </div>
  );
};

export default SystemInfoView;
