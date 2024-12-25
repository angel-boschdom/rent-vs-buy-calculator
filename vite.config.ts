import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: '/',  // Set base path to the root for GitHub Pages
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),  // Ensure output goes directly to dist
    emptyOutDir: true,
  }
})
