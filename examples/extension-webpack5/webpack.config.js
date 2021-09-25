const path = require('path')
const WebExtensionTarget = require('../..')
// const WebExtensionTarget = require('webpack-target-webextension')

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: {
    content: path.resolve(__dirname, 'src', 'content'),
    background: path.resolve(__dirname, 'src', 'background'),
  },
  optimization: {
    minimize: false,
  },
  output: {
    filename: '[name].js',
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    // Remove this if your environment does not support dynamicImport
    environment: { dynamicImport: true },
  },
  target: 'web',
  plugins: [new WebExtensionTarget()],
}

// only for this example
module.exports.resolve = {
  alias: {
    'webpack-target-webextension': path.resolve(__dirname, '../..'),
  },
}
