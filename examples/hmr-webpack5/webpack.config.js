const { resolve } = require('path')
const WebExtensionTarget = require('../..')
// const WebExtensionTarget = require('webpack-target-webextension')

module.exports = {
  entry: {
    background: resolve(__dirname, 'src/background.js'),
    content: resolve(__dirname, 'src/content.js'),
    options: resolve(__dirname, 'src/options.js'),
  },
  mode: 'development',
  optimization: {
    // Chrome bug https://bugs.chromium.org/p/chromium/issues/detail?id=1108199
    splitChunks: { automaticNameDelimiter: '-' },
  },
  output: {
    path: resolve(__dirname, 'dist/'),
    publicPath: 'dist/',
  },
  devServer: {
    // Have to write disk cause plugin cannot be loaded over network
    writeToDisk: true,
    compress: false,
    hot: true,
    hotOnly: true,
    // WDS does not support chrome-extension:// browser-extension://
    disableHostCheck: true,
    injectClient: true,
    injectHot: true,
    headers: {
      // We're doing CORS request for HMR
      'Access-Control-Allow-Origin': '*',
    },
    // If the content script runs in https, webpack will connect https://localhost:HMR_PORT
    https: false,
  },
  plugins: [new WebExtensionTarget()],
}

// only for this example
module.exports.resolve = {
  alias: {
    'webpack-target-webextension': resolve(__dirname, '../..'),
  },
}
