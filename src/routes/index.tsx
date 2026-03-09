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
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Meme generator powered by ImageMagick — running entirely in your
          browser.
        </p>
        <Button
          variant={debug ? "danger" : "secondary"}
          size="sm"
          onClick={() => setDebug(!debug)}
        >
          {debug ? "Debug on" : "Debug"}
        </Button>
      </div>

      <div className="space-y-4">
        {templateList.map((t) => (
          <div
            key={t.name}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-40 flex-shrink-0 text-center">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {t.name}
                </h3>
                <img
                  className="mx-auto max-w-32 max-h-40 object-contain rounded"
                  src={t.file}
                  alt={`${t.name} template`}
                />
              </div>

              <div className="flex-grow min-w-0">
                <CreateMeme template={t} debug={debug} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
