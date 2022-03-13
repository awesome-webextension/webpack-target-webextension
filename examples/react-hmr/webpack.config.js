const WebExtension = require('webpack-target-webextension')
const webpack = require('webpack')
const { join } = require('path')
const ReactRefreshTypeScript = require('react-refresh-typescript')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/** @returns {webpack.Configuration} */
const config = (a, env) => ({
  devtool: env.mode === 'production' ? undefined : 'eval-cheap-source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            getCustomTransformers: () => ({
              before: [env.mode === 'development' && ReactRefreshTypeScript()].filter(Boolean),
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
    new HtmlWebpackPlugin({ filename: 'options.html', chunks: ['options'] }),
    new WebExtension({
      background: { entry: 'background' },
      // Remove this if you're not using mini-css-extract-plugin.
      weakRuntimeCheck: true
    }),
    env.mode === 'development' && new ReactRefreshPlugin(),
  ].filter(Boolean),
  devServer: {
    hot: 'only',
  },
  optimization: {
    minimize: false,
  },
})
module.exports = config
