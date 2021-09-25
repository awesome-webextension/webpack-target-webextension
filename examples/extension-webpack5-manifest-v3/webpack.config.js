const path = require('path')
const WebExtensionTarget = require('../..')
// const WebExtensionTarget = require('webpack-target-webextension')

module.exports = {
  entry: {
    background: path.resolve(__dirname, 'src', 'background'),
  },
  optimization: {
    minimize: false,
  },
  output: {
    filename: '[name].js',
    publicPath: '/dist/',
    path: path.resolve(__dirname, 'dist'),
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
