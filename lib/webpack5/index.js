// @ts-check
const RuntimePlugin = require('./RuntimePlugin')
const NoDangerNamePlugin = require('./NoDangerNamePlugin')

module.exports = class WebExtensionPlugin5 {
  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    new RuntimePlugin().apply(compiler)
    new NoDangerNamePlugin().apply(compiler)
  }
}
