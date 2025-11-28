import { fileURLToPath, URL } from "node:url";
import { resolve } from "path";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from '@tailwindcss/vite'

const dst = resolve(__dirname, "dist");
const host = "localhost";
const port = 3000;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host,
    port,
    open: false,
    watch: {
      usePolling: true,
      disableGlobbing: false,
      // node_modules is ignored by default
      ignored: [".pnpm-store", "coverage", "dist", "test"],
    },
  },
  resolve: {
    alias: {
      src: fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: dst,
    manifest: true,
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'primevue': ['primevue'],
          'query': ['@tanstack/vue-query'],
          'supabase': ['@supabase/supabase-js'],
          'axios': ['axios'],
        },
      },
    },
  },
});

