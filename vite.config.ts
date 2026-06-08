import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths(), react()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
  },
  optimizeDeps: {
    exclude: ["@imagemagick/magick-wasm"],
  },
});
