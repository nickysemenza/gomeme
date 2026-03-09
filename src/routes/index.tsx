import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { templates } from "~/lib/templates";
import CreateMeme from "~/components/CreateMeme";
import Button from "~/components/Button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [debug, setDebug] = useState(false);
  const templateList = Object.values(templates);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">GoMeme</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          A meme generator powered by ImageMagick — running entirely in your
          browser.
        </p>

        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Supported Inputs
          </h2>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-gray-700">Image URLs (JPG, PNG)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-700">Base64 Image Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-gray-700">Text Content</span>
            </div>
          </div>
        </div>

        <Button
          variant={debug ? "danger" : "secondary"}
          onClick={() => setDebug(!debug)}
        >
          {debug ? "Disable Debug" : "Enable Debug"}
        </Button>
      </div>

      <div className="space-y-8">
        {templateList.map((t) => (
          <div
            key={t.name}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/4 flex-shrink-0">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {t.name}
                    </h3>
                    <div className="mx-auto w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        src={t.file}
                        alt={`${t.name} template`}
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:w-3/4 flex-grow">
                  <CreateMeme template={t} debug={debug} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
