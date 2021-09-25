const { resolve } = require('path')
const WebExtensionTarget = require('../..').default
// const WebExtensionTarget = require('webpack-target-webextension')

module.exports = {
  entry: {
    background: resolve(__dirname, 'src/background.js'),
    content: resolve(__dirname, 'src/content.js'),
    options: resolve(__dirname, 'src/options.js'),
  },
  mode: 'development',
  output: {
    path: resolve(__dirname, 'dist/'),
    publicPath: 'dist/',
    environment: { dynamicImport: true },
  },
  devServer: {
    hot: true,
  },
  plugins: [new WebExtensionTarget({ background: { entry: 'background' } })],
}

// only for this example
module.exports.resolve = {
  alias: {
    'webpack-target-webextension': resolve(__dirname, '../..'),
  },
}
