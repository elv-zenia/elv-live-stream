const Path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  target: "web",
  stats: {
    warningsFilter: ["./node_modules/ethers/dist/ethers.min.js"]
  },
  output: {
    chunkFilename: "[name].[contenthash].bundle.js",
  },
  devServer: {
    allowedHosts: "all",
    port: 8155,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "POST"
    }
  },
  mode: "development",
  devtool: "source-map",
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: Path.join(__dirname, "configuration.js"), to: Path.join(__dirname, "dist", "configuration.js") }
      ]
    }),
    new HTMLWebpackPlugin({
      template: Path.join(__dirname, "src", "index.html"),
      title: "Eluvio Live Stream",
      cache: false,
      filename: "index.html",
      favicon: "./src/static/images/favicon.png",
    }),
    new webpack.ProvidePlugin({
      process: "process/browser"
    })
  ],
  resolve: {
    alias: {
      "browser": "process/browser",
      Assets: Path.resolve(__dirname, "src/static"),
      Components: Path.resolve(__dirname, "src/components"),
      Pages: Path.resolve(__dirname, "/src/pages")
    },
    fallback: {
      "fs": false,
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "process/browser": require.resolve("process/browser")
    },
    extensions: [".js", ".jsx", ".scss", ".png", ".svg"]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: "defaults" }],
              ["@babel/preset-react", {"runtime": "automatic"}]
            ]
          },
        }
      },
      {
        test: /\.(css|scss)$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader"
      },
      {
        test: /\.(woff2?|ttf|json)$/i,
        loader: "file-loader",
        type: "javascript/auto"
      },
      {
        test: /\.(gif|png|jpe?g)$/i,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader"
          }
        ],
        type: "javascript/auto"
      },
      {
        test: /\.(txt|bin|abi)$/i,
        loader: "raw-loader",
        type: "javascript/auto"
      },
      {
        test: /\.ya?ml$/,
        type: "json",
        use: "yaml-loader"
      }
    ]
  }
};
