import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { memeClient } from "./connect";
import { buildURL } from "./util";
import CreateMeme from "./components/CreateMeme";
import Button from "./components/Button";
import ReactJson from "react-json-view";

const ProtoTest: React.FC = () => {
  const [debug, setDebug] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => memeClient.getTemplates({}),
  });
  const templates = data?.Templates ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GoMeme</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            A powerful meme generator powered by ImageMagick. Create custom memes using our
            collection of templates with flexible input options.
          </p>

          {/* Navigation */}
          <div className="flex justify-center space-x-4 mb-8">
            <a
              href="/editor"
              className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <span className="mr-2">🛠️</span>
              Template Editor
            </a>
            <a
              href="/system"
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <span className="mr-2">⚙️</span>
              System Info
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Supported Inputs</h2>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Image URLs (JPG, PNG)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Base64 Image Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">Text Content</span>
              </div>
            </div>
          </div>

          <Button
            variant={debug ? "danger" : "secondary"}
            onClick={() => setDebug(!debug)}
            icon={debug ? '🔍' : '⚡'}
          >
            {debug ? 'Disable Debug' : 'Enable Debug'}
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="space-y-8">
          {templates.map((t) => (
            <div key={t.Name} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Template Info */}
                  <div className="lg:w-1/4 flex-shrink-0">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{t.Name}</h3>
                      <div className="mx-auto w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          className="w-full h-full object-cover"
                          src={buildURL(t.URL)}
                          alt={`${t.Name} template`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Meme Creator */}
                  <div className="lg:w-3/4 flex-grow">
                    <CreateMeme
                      template={t}
                      onCreate={() => {}}
                      debug={debug}
                    />
                  </div>
                </div>

                {/* Debug Panel */}
                {debug && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Debug Information</h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-64">
                      <ReactJson
                        src={t as object}
                        theme="monokai"
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty/Loading State */}
        {(isLoading || templates.length === 0) && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🎭</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isLoading ? "Loading templates..." : "No templates available"}
            </h3>
            <p className="text-gray-600">
              {isLoading ? "Please wait..." : "Check server connection"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtoTest;
