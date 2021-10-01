const WebExtension = require('webpack-target-webextension')
const webpack = require('webpack')
const { join } = require('path')

/** @type {webpack.Configuration} */
const config = {
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
    // Set output.environment.dynamicImport to true
    // to enable native chunk loading via import()
    // And you need to set
    //    "web_accessible_resources": ["/dist/*.js"],
    // in your manifest.json
    environment: { dynamicImport: true },
  },
  plugins: [new WebExtension()],
}
module.exports = config
