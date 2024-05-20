import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import commonjsExternals from "vite-plugin-commonjs-externals";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    commonjsExternals({
      externals: ["fs/promises", "require"],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3002,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
