import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50 antialiased">
      <nav className="bg-white border-b border-gray-200 px-4 py-1.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-sm font-bold text-gray-900">
            gomeme
          </Link>
          <div className="flex gap-3 text-xs">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-900 [&.active]:font-semibold [&.active]:text-gray-900"
            >
              Generator
            </Link>
            <Link
              to="/editor"
              className="text-gray-500 hover:text-gray-900 [&.active]:font-semibold [&.active]:text-gray-900"
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
