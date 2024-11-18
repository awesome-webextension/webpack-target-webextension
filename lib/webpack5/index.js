// @ts-check

// Make dynamic import & chunk splitting works.
const ChuckLoaderRuntimePlugin = require('./ChunkLoader')
// Ban invalid file names in web extension
const NoDangerNamePlugin = require('./NoDangerNamePlugin')
// Provide support for MV3
const ServiceWorkerEntryPlugin = require('./ServiceWorkerPlugin')
// Automatically tweak HMR server
const HMRDevServerPlugin = require('./HMRDevServer')

module.exports = class WebExtensionPlugin {
  /**
   * @param {import('../../index.d.ts').WebExtensionPluginOptions} options
   */
  constructor(options = {}) {
    const { background } = options
    if (background && (background.entry || background.manifest)) {
      console.warn(`[webpack-extension-target] background.entry and background.manifest has been deprecated.
    - background.manifest is no longer needed.
    - background.entry should be replaced with background.pageEntry and background.serviceWorkerEntry instead.`)
      if (background.pageEntry || background.serviceWorkerEntry) {
        throw new Error(
          `[webpack-extension-target] Deprecated background.entry and background.manifest cannot be specified with background.pageEntry or background.serviceWorkerEntry.`
        )
      }
    }
    this.options = options
  }
  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    const { background } = this.options
    if (background) {
      if (background.serviceWorkerEntry) {
        if (background.serviceWorkerEntry === background.pageEntry) {
          // TODO: throw error in next version.
          console.warn(
            `[webpack-extension-target] background.serviceWorkerEntry must not be the same as background.pageEntry. Service Worker entry only supports importScript, but importScript does not exist in background page (mv2) or limited event page (mv3).
    A possible fix is to create two new files to be the service worker entry and the page entry, then those two files imports the background entry.`
          )
        }
        new ServiceWorkerEntryPlugin(
          background,
          background.serviceWorkerEntry,
          !!this.options.noRspackDynamicImportModeWarning
        ).apply(compiler)
      }
      if (background.manifest === 3 && background.entry) {
        new ServiceWorkerEntryPlugin(
          background,
          background.entry,
          !!this.options.noRspackDynamicImportModeWarning
        ).apply(compiler)
      }
    }
    new ChuckLoaderRuntimePlugin(this.options.background, this.options.weakRuntimeCheck).apply(compiler)
    new NoDangerNamePlugin().apply(compiler)
    if (this.options.hmrConfig !== false) new HMRDevServerPlugin().apply(compiler)
  }
}
