import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split the heaviest third-party libs into their own chunks so the
        // main bundle stays lean and the browser can cache vendors separately.
        manualChunks: {
          // Split the heaviest, rarely-changing dependencies into their own
          // long-lived cacheable chunks so the app shell stays lean and an
          // app-code change doesn't force browsers to re-download ~1MB of 3D
          // engine. three.js + @google/model-viewer power the 3D product
          // previews that appear throughout the landing page, so they are
          // genuinely part of the initial payload — isolating them keeps the
          // main application chunk small and independently parseable.
          // (recharts is intentionally NOT listed: it is unused, so leaving it
          // out lets Rollup tree-shake it away entirely.)
          "vendor-three": ["three"],
          "vendor-model-viewer": ["@google/model-viewer"],
          "vendor-react": ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
