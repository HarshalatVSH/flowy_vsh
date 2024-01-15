"use strict";

const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    contentScript: "./src/contentScript/contentScript.ts",
    pageWorld: "@inboxsdk/core/pageWorld.js",
    // service_worker: "@inboxsdk/core/background.js",
    background: path.resolve("src/background/background.ts"),
  },
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "src/static" }],
    }),
  ],
};

// const path = require("path");
// const CopyPlugin = require("copy-webpack-plugin");
// const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const tailwindcss = require("tailwindcss");
// const autoprefixer = require("autoprefixer");

// module.exports = {
//   entry: {
//     service_worker: "@inboxsdk/core/background.js",
//     // service_worker: path.resolve("src/background/service_workers.ts"),
//     pageWorld: "@inboxsdk/core/pageWorld.js",
//     // background: "@inboxsdk/core/background.js",
//     contentScript: path.resolve("src/contentScript/contentScript.ts"),
//   },
//   module: {
//     rules: [
//       {
//         use: "ts-loader",
//         test: /\.tsx?$/,
//         exclude: /node_modules/,
//       },
//       {
//         test: /\.m?jsx?$/,
//         enforce: "pre",
//         use: ["source-map-loader"],
//       },
//       {
//         test: /\.css$/i,
//         use: [
//           "style-loader",
//           {
//             loader: "css-loader",
//             options: {
//               importLoaders: 1,
//             },
//           },
//           {
//             loader: "postcss-loader", // postcss loader needed for tailwindcss
//             options: {
//               postcssOptions: {
//                 ident: "postcss",
//                 plugins: [tailwindcss, autoprefixer],
//               },
//             },
//           },
//         ],
//       },
//       {
//         type: "assets/resource",
//         test: /\.(png|jpg|jpeg|gif|woff|woff2|tff|eot|svg)$/,
//       },
//     ],
//   },
//   plugins: [
//     new CleanWebpackPlugin({
//       cleanStaleWebpackAssets: false,
//     }),
//     new CopyPlugin({
//       patterns: [
//         {
//           from: path.resolve("src/static"),
//           to: path.resolve("dist"),
//         },
//       ],
//     }),
//   ],
//   resolve: {
//     extensions: [".tsx", ".js", ".ts", "jsx"],
//   },
//   output: {
//     filename: "[name].js",
//     path: path.join(__dirname, "dist"),
//     clean: true,
//   },
//   optimization: {
//     splitChunks: {
//       chunks: "all",
//     },
//   },
// };
