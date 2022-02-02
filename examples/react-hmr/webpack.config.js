const WebExtension = require('webpack-target-webextension')
const webpack = require('webpack')
const { join } = require('path')
const ReactRefreshTypeScript = require('react-refresh-typescript')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isDevelopment = process.env.NODE_ENV !== 'production'

/** @type {webpack.Configuration} */
const config = {
  devtool: 'eval-cheap-source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
        ],
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            getCustomTransformers: () => ({
              before: [isDevelopment && ReactRefreshTypeScript()].filter(Boolean),
            }),
          },
        },
      },
    ],
  },
  entry: {
    background: join(__dirname, './src/background.ts'),
    content: join(__dirname, './src/content.tsx'),
    options: join(__dirname, './src/options.tsx'),
  },
  output: {
    path: join(__dirname, './dist'),
    // Our assets are emitted in /dist folder of our web extension.
    publicPath: '/dist/',
    environment: {
      dynamicImport: true,
    },
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new WebExtension({ background: { entry: 'background' } }),
    isDevelopment && new ReactRefreshPlugin(),
  ].filter(Boolean),
  devServer: {
    hot: 'only',
  },
}
module.exports = config
