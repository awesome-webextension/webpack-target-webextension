const WebExtension = require('webpack-target-webextension')
const webpack = require('webpack')
const { join } = require('path')

/** @type {webpack.Configuration} */
const config = {
  // No eval allowed in MV3
  devtool: 'cheap-source-map',
  entry: {
    content: join(__dirname, './content.js'),
    background: join(__dirname, './background.js'),
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
