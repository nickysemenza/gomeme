import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen antialiased">
      <nav className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
          <Link
            to="/"
            className="font-display text-lg font-extrabold tracking-tight text-ink"
          >
            go<span className="text-coral-500">meme</span>
          </Link>
          <div className="chip flex items-center gap-1">
            <Link
              to="/"
              className="rounded-full px-3 py-1.5 text-slate transition-colors hover:text-ink [&.active]:bg-coral-500/10 [&.active]:text-coral-700"
            >
              Generator
            </Link>
            <Link
              to="/editor"
              className="rounded-full px-3 py-1.5 text-slate transition-colors hover:text-ink [&.active]:bg-coral-500/10 [&.active]:text-coral-700"
            >
              Editor
            </Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
