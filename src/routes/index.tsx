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
      <h1 className="sr-only">gomeme — meme generator</h1>

      {/* Hero */}
      <header className="reveal flex flex-col gap-5 pt-16 pb-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="chip text-coral-600">Glorified ImageMagick wrapper</p>
          <h2 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
            Make the
            <br />
            <span className="text-gradient">meme.</span>
          </h2>
          <p className="mt-5 max-w-md text-slate">
            Drop an image or some text into a template. Everything renders right
            here in your browser — nothing leaves the tab.
          </p>
        </div>
        <button
          aria-pressed={debug}
          onClick={() => setDebug(!debug)}
          className={`chip self-start rounded-full border px-4 py-2 transition-colors md:self-auto ${
            debug
              ? "border-coral-500/40 bg-coral-500/10 text-coral-700"
              : "border-line text-slate hover:border-coral-400 hover:text-ink"
          }`}
        >
          {debug ? "Op-log on" : "Op-log"}
        </button>
      </header>

      <div className="space-y-6">
        {templateList.map((t, i) => (
          <section
            key={t.name}
            className="surface surface-hover reveal overflow-hidden p-5"
            style={{ animationDelay: `${0.08 * (i + 1)}s` }}
          >
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex flex-shrink-0 items-start gap-4 lg:w-44 lg:flex-col">
                <img
                  className="h-24 w-24 flex-shrink-0 rounded-xl object-cover ring-1 ring-line lg:h-auto lg:w-full"
                  src={t.file}
                  alt={`${t.name} template`}
                />
                <div>
                  <h3 className="font-display text-lg font-bold lowercase tracking-tight text-ink">
                    {t.name}
                  </h3>
                  <p className="chip mt-1 text-mist">
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
