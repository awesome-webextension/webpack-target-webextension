const path = require('path')
const WebExtensionTarget = require('../index')

module.exports = {
  entry: {
    content: path.resolve(__dirname, 'src', 'content'),
    background: path.resolve(__dirname, 'src', 'background')
  },
  output: {
    filename: '[name].js',
    publicPath: '/dist/',
    path: path.resolve(__dirname, 'dist')
  },
  target: WebExtensionTarget()
}
