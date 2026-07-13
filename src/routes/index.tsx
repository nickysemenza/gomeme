import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { listTemplates } from "~/lib/registry";
import CreateMeme from "~/components/CreateMeme";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [debug, setDebug] = useState(false);
  // Read on mount: built-in templates plus any saved from the editor.
  const [templateList] = useState(() => Object.values(listTemplates()));

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-2 pt-8 pb-6">
        <h1 className="text-xl font-semibold text-ink">Templates</h1>
        <p className="text-sm text-muted">
          Renders in your browser via ImageMagick — nothing leaves the tab.
        </p>
        <label className="ml-auto flex cursor-pointer select-none items-center gap-1.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={debug}
            onChange={(e) => setDebug(e.target.checked)}
            className="accent-primary"
          />
          Op-log
        </label>
      </header>

      <div className="space-y-6">
        {templateList.map((t) => (
          <section key={t.name} className="surface overflow-hidden p-5">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex flex-shrink-0 items-start gap-4 lg:w-44 lg:flex-col">
                <img
                  className="h-24 w-24 flex-shrink-0 rounded-md object-cover ring-1 ring-line lg:h-auto lg:w-full"
                  src={t.file}
                  alt={`${t.name} template`}
                />
                <div>
                  <h2 className="text-sm font-semibold text-ink">{t.name}</h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {t.targets.length} target{t.targets.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="min-w-0 flex-grow lg:border-l lg:border-line lg:pl-6">
                <CreateMeme template={t} debug={debug} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
