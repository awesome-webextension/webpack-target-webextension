const webpackMajorVersion = require('./lib/webpack-version')

module.exports =
  webpackMajorVersion === 4
    ? (nodeConfig) => (compiler) => {
        const WebExtPlugin5 = require('./lib/webpack4/index')
        new WebExtPlugin5(nodeConfig).apply(compiler)
      }
    : require('./lib/webpack5/index')
