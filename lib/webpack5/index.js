// @ts-check
const WebExtensionChuckLoaderRuntimePlugin = require('./RuntimePlugin')
const NoDangerNamePlugin = require('./NoDangerNamePlugin')
const ManifestV3ServiceWorkerPlugin = require('./ManifestV3ServiceWorkerPlugin')

module.exports = class WebExtensionPlugin5 {
  /**
   * @param {import('../../').WebExtensionPluginOptions} options
   */
  constructor(options = {}) {
    this.options = options
  }
  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    if (this.options.background) {
      if (this.options.background.manifest === 3) {
        new ManifestV3ServiceWorkerPlugin(this.options.background).apply(compiler)
      }
    }
    new WebExtensionChuckLoaderRuntimePlugin().apply(compiler)
    new NoDangerNamePlugin().apply(compiler)
  }
}
