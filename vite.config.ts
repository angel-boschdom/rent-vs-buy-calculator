// file: vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',  // Set base path to the root for GitHub Pages
  plugins: [react()]
})
