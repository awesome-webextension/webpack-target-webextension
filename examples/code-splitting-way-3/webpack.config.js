const WebExtension = require('webpack-target-webextension')
const webpack = require('webpack')
const { join } = require('path')

/** @type {webpack.Configuration} */
const config = {
  entry: {
    // The name of this entry is used in line 24.
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
        serviceWorkerEntry: 'background',
      },
    }),
  ],
}
module.exports = config
