import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "node:path";
// import * as path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  // root: path.resolve(__dirname, "src"),
  resolve: {
    alias: {
      "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
      "~bootstrap-icons": path.resolve(
        __dirname,
        "node_modules/bootstrap-icons",
      ),
    },
  },
  plugins: [react()],
  // optimizeDeps: { exclude: ['fsevents'] }
  // server: {
  //   port: 8080,
  //   origin: "http://127.0.0.1:8080",
  // },
  // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // // @ts-expect-error
  //  hot: true,
  //},
});
