import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "production",     
  entry: "./game/index.js",
  output: {
    filename: "main.[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  experiments: {
    outputModule: true,
  },
  target: "node",
  devServer: {
    static: path.resolve(__dirname, "dist"),
    port: 5000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    }),
    new CopyPlugin({
      patterns: [
        {from: path.resolve(__dirname, "src"), to: path.resolve(__dirname, "dist", "src")}
      ]
    })
  ],
  module: {
      rules: [
          {
            test: /\.(?:js|mjs|cjs)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                targets: "defaults",
                presets: [
                  ['@babel/preset-env']
                ]
              }
            }
          }
      ]
  },
  resolve: {
    extensions: [".js", ".json"],
  },
};