import React, { useState, useEffect } from "react";

import { GetTemplatesParams, Template } from "./proto/meme_pb";
import { getAPIClient, buildURL } from "./util";
import CreateMeme from "./components/CreateMeme";
import ReactJson from "react-json-view";

const ProtoTest: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);

  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const fetchMemes = () => {
      const req = new GetTemplatesParams();
      getAPIClient().getTemplates(req, (err, reply) => {
        console.log({ err, reply });
        if (reply) {
          const list = reply.getTemplatesList();
          setTemplates(list);
        }
      });
    };
    fetchMemes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              🎭 gomeme
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              A powerful meme generator powered by ImageMagick. Create custom memes using templates 
              with intelligent schema-based input handling.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Supported Input Types:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">🖼️</span>
                </div>
                <span className="text-gray-700 font-medium">Image URLs (JPG, PNG)</span>
              </div>
              <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">📷</span>
                </div>
                <span className="text-gray-700 font-medium">Base64 Image Data</span>
              </div>
              <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">✏️</span>
                </div>
                <span className="text-gray-700 font-medium">Text Content</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <button
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                debug
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
              onClick={() => {
                setDebug(!debug);
              }}
            >
              {debug ? "🔍 Disable Debug" : "🛠️ Enable Debug"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Templates Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          🎨 Meme Templates
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {templates.map((t) => (
            <div key={t.getName()} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {/* Template Preview */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="aspect-w-16 aspect-h-9 p-4">
                  <img
                    className="w-full h-48 object-contain rounded-lg"
                    src={buildURL(t.getUrl())}
                    alt={`${t.getName()} template`}
                  />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {t.getName()}
                  </span>
                </div>
              </div>
              
              {/* Meme Creation Section */}
              <div className="p-6">
                <CreateMeme
                  template={t}
                  onCreate={(meme) => {}}
                  debug={debug}
                />
              </div>

              {/* Debug Section */}
              {debug && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Information:</h4>
                  <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-auto">
                    <ReactJson 
                      src={t.toObject(false)} 
                      theme="monokai" 
                      collapsed={1}
                      enableClipboard={false}
                      displayDataTypes={false}
                      displayObjectSize={false}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProtoTest;
