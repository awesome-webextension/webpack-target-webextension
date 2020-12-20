const path = require('path')
const WebExtensionTarget = require('../..')
// const WebExtensionTarget = require('webpack-target-webextension')

module.exports = {
  entry: {
    content: path.resolve(__dirname, 'src', 'content'),
    background: path.resolve(__dirname, 'src', 'background')
  },
  optimization: {
    minimize: false,
    // Chrome bug https://bugs.chromium.org/p/chromium/issues/detail?id=1108199
    splitChunks: { automaticNameDelimiter: "-" }
  },
  output: {
    filename: '[name].js',
    publicPath: '/dist/',
    path: path.resolve(__dirname, 'dist')
  },
  target: WebExtensionTarget()
}

// only for this example
module.exports.resolve = {
  alias: {
    'webpack-target-webextension': path.resolve(__dirname, '../..')
  }
}