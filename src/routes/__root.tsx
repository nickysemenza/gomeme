import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen antialiased">
      <nav className="sticky top-0 z-50 border-b border-line bg-bg">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
          <Link to="/" className="text-lg font-bold tracking-tight text-ink">
            go<span className="text-primary">meme</span>
          </Link>
          <div className="flex items-center gap-5 text-sm font-medium">
            <Link
              to="/"
              className="text-muted transition-colors hover:text-ink [&.active]:text-ink"
            >
              Generator
            </Link>
            <Link
              to="/editor"
              className="text-muted transition-colors hover:text-ink [&.active]:text-ink"
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
