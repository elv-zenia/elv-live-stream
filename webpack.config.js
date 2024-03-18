const Path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

let plugins = [
  new HtmlWebpackPlugin({
    title: "Eluvio Livestream Manager",
    template: Path.join(__dirname, "src", "index.html"),
    filename: "index.html",
    inject: "body"
  }),
  new CopyWebpackPlugin({
    patterns: [
      { from: Path.join(__dirname, "configuration.js"), to: Path.join(__dirname, "dist", "configuration.js") }
    ]
  })
];

if(process.env.ANALYZE_BUNDLE) {
  plugins.push(new BundleAnalyzerPlugin());
}

module.exports = {
  entry: Path.resolve(__dirname, "src/index.js"),
  target: "web",
  output: {
    path: Path.resolve(__dirname, "dist"),
    clean: true,
    filename: "main.js",
    publicPath: process.env.ASSET_PATH,
    chunkFilename: "bundle.[id].[chunkhash].js"
  },
  plugins,
  devServer: {
    hot: true,
    historyApiFallback: true,
    allowedHosts: "all",
    port: 8155,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "POST"
    },
    // This is to allow configuration.js to be accessed
    static: {
      directory: Path.resolve(__dirname, "./config"),
      publicPath: "/"
    }
  },
  mode: "development",
  devtool: "eval-source-map",
  externals: {
    crypto: "crypto"
  },
  resolve: {
    alias: {
      Assets: Path.resolve(__dirname, "src/static"),
      Components: Path.resolve(__dirname, "src/components"),
      Pages: Path.resolve(__dirname, "src/pages"),
      Routes: Path.resolve(__dirname, "src/routes"),
      Stores: Path.resolve(__dirname, "src/stores"),
      Data: Path.resolve(__dirname, "src/data"),
      // Force webpack to use *one* copy of bn.js instead of 8
      "bn.js": Path.resolve(Path.join(__dirname, "node_modules", "bn.js"))
    },
    extensions: [".js", ".jsx", ".mjs", ".scss", ".png", ".svg"],
    fallback: {
      "url": require.resolve("url"),
      "stream": require.resolve("stream-browserify")
    }
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2
            }
          },
          "postcss-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(js|mjs|jsx)$/,
        exclude: /node_modules\/(?!@eluvio\/elv-embed)/,
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-env",
            "@babel/preset-react",
          ]
        }
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader"
      },
      {
        test: /\.(gif|png|jpe?g|otf|woff2?|ttf)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(txt|bin|abi)$/i,
        type: "asset/source"
      },
      {
        test: /\.ya?ml$/,
        use: "yaml-loader"
      }
    ]
  }
};

