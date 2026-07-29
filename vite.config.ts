/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react-markdown") ||
            id.includes("node_modules/react-syntax-highlighter") ||
            id.includes("node_modules/remark") ||
            id.includes("node_modules/rehype") ||
            id.includes("node_modules/micromark") ||
            id.includes("node_modules/mdast") ||
            id.includes("node_modules/hast") ||
            id.includes("node_modules/refractor")
          ) {
            return "markdown-vendor";
          }
          if (id.includes("node_modules/codemirror") || id.includes("node_modules/@codemirror")) {
            return "codemirror-vendor";
          }
          if (id.includes("node_modules/katex")) {
            return "katex-vendor";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "Outliner by R. Smol.",
        short_name: "RS Outliner",
        description: "Offline first PWA outliner app.",
        theme_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2,ttf}"],
        // Custom file
        navigateFallbackDenylist: [/^\/version\.json$/],
        globIgnores: ["**/version.json"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // runtimeCaching: [
        //   {
        //     // Matches any external or internal URL ending in standard image extensions
        //     // urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)(?:\?.*)?$/i,
        //     urlPattern: ({ request }) => request.destination === "image",
        //     handler: "CacheFirst",
        //     options: {
        //       cacheName: "external-images-cache",

        //       cacheableResponse: {
        //         statuses: [0, 200],
        //       },

        //       expiration: {
        //         maxEntries: 50, // Caps the total number of images saved
        //         maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        //         purgeOnQuotaError: true, // Automatically safely clears if the device fills up
        //       },
        //     },
        //   },
        // ],
      },

      devOptions: {
        enabled: false,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
    visualizer({
      open: true,
      filename: "bundle-report.html",
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
  // shadcn config
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  // github
  // base: "/pwa-react-outliner/",
});
