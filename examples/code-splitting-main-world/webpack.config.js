const WebExtension = require('webpack-target-webextension')
const webpack = require('webpack')
const { join } = require('path')

/** @type {webpack.Configuration} */
const config = {
  entry: {
    main: join(__dirname, '../src/main.js'),
  },
  optimization: {
    minimize: false,
  },
  output: {
    path: join(__dirname, './dist'),
    // Main world content script must know where they came from.
    // Replace with your own extension ID. If you want to set this in runtime, see https://webpack.js.org/guides/public-path/
    // Set it to publicPath: "/dist/" works only for scripts loading and new URL("./asset.txt", import.meta.url) will be broken.
    publicPath: 'chrome-extension://jknoiechepeohmcaoeehjaecapdplcia/dist/',

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
