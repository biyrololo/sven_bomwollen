import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "production",     
  entry: "./server.js",
  output: {
    filename: "main.[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    library: {
      type: "module",
    },
  },
  resolve: {
    extensions: [".js", ".mjs", ".ts", ".jsx", ".tsx", ".json"],
  },
  target: "node",
  experiments: {
    outputModule: true,
  }
};