const WebExtension = require('webpack-target-webextension')
const webpack = require('webpack')
const { join } = require('path')

/** @type {webpack.Configuration} */
const config = {
  // No eval allowed in MV3
  devtool: 'cheap-source-map',
  entry: {
    background: join(__dirname, '../src/background.js'),
    content: join(__dirname, '../src/content.js'),
    options: join(__dirname, '../src/options.js'),
  },
  optimization: {
    // minimize: false,
  },
  output: {
    path: join(__dirname, './dist'),
    // Our assets are emitted in /dist folder of our web extension.
    publicPath: '/dist/',
  },
  plugins: [
    new WebExtension({
      background: {
        entry: 'background',
        // !! Add this to support manifest v3
        manifest: 3,
      },
    }),
  ],
  // Add devServer.hot = true or "only" to enable HMR.
  devServer: {
    hot: 'only',
  },
}
module.exports = config
