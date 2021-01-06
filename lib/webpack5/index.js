// @ts-check
const RuntimePlugin = require('./RuntimePlugin')
const NoDangerNamePlugin = require('./NoDangerNamePlugin')
module.exports = class WebExtensionPlugin5 {
  constructor(nodeConfig) {
    this.nodeConfig = nodeConfig
  }
  apply(compiler) {
    new RuntimePlugin().apply(compiler)
    new NoDangerNamePlugin().apply(compiler)
  }
}
