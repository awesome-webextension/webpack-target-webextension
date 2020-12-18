// @ts-check
const RuntimePlugin = require('./RuntimePlugin')
module.exports = class WebExtensionPlugin5 {
  constructor(nodeConfig) {
    this.nodeConfig = nodeConfig
  }
  apply(compiler) {
    new RuntimePlugin().apply(compiler)
  }
}
