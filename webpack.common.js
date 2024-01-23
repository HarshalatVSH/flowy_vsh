const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

module.exports = {
  entry: {
    popup: path.resolve("src/popup/index.tsx"),
    contentScript: "./src/contentScript/contentScript.ts",
    pageWorld: "@inboxsdk/core/pageWorld.js",
    background: path.resolve("src/background/background.ts"),
    outlookMail: path.resolve("src/contentScript/outlookContentScript.ts"),
  },
  module: {
    rules: [
      {
        use: "ts-loader",
        test: /\.tsx?$/,
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                ident: "postcss",
                plugins: [tailwindcss, autoprefixer],
              },
            },
          },
        ],
      },
      {
        type: "assets/resource",
        test: /\.(png|jpg|jpeg|gif|woff|woff2|tff|eot|svg)$/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve("src/static"),
          to: path.resolve("dist"),
        },
      ],
    }),
    ...getHtmlPlugins(["popup"]),
  ],
  resolve: {
    extensions: [".tsx", ".js", ".ts"],
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "dist"),
  },
};

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlPlugin({
        title: "Flowy Extension",
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  );
}
