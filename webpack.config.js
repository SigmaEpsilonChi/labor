const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  // devtool: 'eval',
  // devtool: "eval-source-map",
  devtool: "inline-source-map",
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: '[name].bundle.js',
    // publicPath: "/dist/",
  },
  devServer: {
    contentBase: './docs',
  },
  plugins: [
    new CleanWebpackPlugin(['docs']),
    // new webpack.HotModuleReplacementPlugin(),
    new WebpackBuildNotifierPlugin(),
    new HtmlWebpackPlugin({
      title: 'Labor Flows'
    }),
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      include: path.join(__dirname, 'src')
    }, {
      test: /\.css$/,
      loaders: ["style-loader", "css-loader"]
    }, {
      test: /\.csv$/,
      loader: 'csv-loader',
      options: {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true
      }
    }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss', '.css', '.json', '.csv']
  }
};