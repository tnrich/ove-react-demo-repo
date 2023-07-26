import react from "@vitejs/plugin-react";
import path from "path";

export default {
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  resolve: {
    alias: {
      "@teselagen/ove": path.resolve(
        __dirname,
        "./node_modules/@teselagen/ove"
      ),
      "@teselagen/ui": path.resolve(__dirname, "./node_modules/@teselagen/ui"),
      "@teselagen/range-utils": path.join(
        __dirname,
        "node_modules/@teselagen/range-utils"
      ),
      "@teselagen/file-utils": path.join(
        __dirname,
        "node_modules/@teselagen/file-utils"
      ),
      dayjs: path.join(__dirname, "node_modules/dayjs"),
      "@teselagen/sequence-utils": path.join(
        __dirname,
        "node_modules/@teselagen/sequence-utils"
      ),
      "@teselagen/bio-parsers": path.join(
        __dirname,
        "node_modules/@teselagen/bio-parsers"
      ),
    },
  },
  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for segment analytics lib to work
    global: {},
  },
};
