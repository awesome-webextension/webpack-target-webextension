// @ts-check

// Make dynamic import & chunk splitting works.
const ChuckLoaderRuntimePlugin = require('./ChunkLoader')
// Ban invalid file names in web extension
const NoDangerNamePlugin = require('./NoDangerNamePlugin')
// Provide support for MV3
const MV3ServiceWorkerPlugin = require('./MV3ServiceWorkerPlugin')

module.exports = class WebExtensionPlugin {
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
        new MV3ServiceWorkerPlugin(this.options.background).apply(compiler)
      }
    }
    new ChuckLoaderRuntimePlugin().apply(compiler)
    new NoDangerNamePlugin().apply(compiler)
  }
}
