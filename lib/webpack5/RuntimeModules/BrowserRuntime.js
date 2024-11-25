/**
 * @param {import('webpack')} webpack
 * @param {boolean} acceptWeak if accept weak runtime check
 * @returns {import('webpack').RuntimeModule}
 */
module.exports = function BrowserRuntimeModule(webpack, acceptWeak) {
  const { RuntimeModule, Template } = webpack
  class BrowserRuntimeModule extends RuntimeModule {
    constructor() {
      super('WebExtensionBrowserRuntime', RuntimeModule.STAGE_NORMAL)
    }

    /**
     * @returns {string} runtime code
     */
    generate() {
      const { compilation } = this
      if (!compilation)
        return Template.asString(
          '/* [webpack-target-webextension] BrowserRuntimeModule skipped because no compilation is found. */'
        )
      return Template.asString(
        [
          `var isBrowser, runtime;`,
          `try {`,
          Template.indent([
            `if (typeof browser !== 'undefined' && typeof browser.runtime === 'object' && typeof browser.runtime.getURL === 'function') {`,
            Template.indent([`isBrowser = true`, `runtime = browser`]),
            `}`,
          ]),
          `} catch (_) {}`,
          `if (!isBrowser) {`,
          Template.indent([
            `try {`,
            Template.indent([
              `if (typeof chrome !== 'undefined' && typeof chrome.runtime === 'object' && typeof chrome.runtime.getURL === 'function') {`,
              Template.indent([`runtime = chrome`]),
              `}`,
            ]),
            '} catch (_) {}',
          ]),
          `}`,
          `${module.exports.RuntimeGlobalIsBrowser} = isBrowser`,
          `${module.exports.RuntimeGlobal} = runtime || { get runtime() {`,
          Template.indent(`throw new Error("No chrome or browser runtime found")`),
          `} }`,
          acceptWeak ? `if (typeof self !== "object" || !self.addEventListener) {` : '',
          acceptWeak ? Template.indent([`${module.exports.RuntimeGlobal} = { runtime: { getURL: String } }`]) : '',
          acceptWeak ? '}' : '',
        ].filter(Boolean)
      )
    }
  }
  return new BrowserRuntimeModule()
}
module.exports.RuntimeGlobal = '__webpack_require__.webExtRt'
module.exports.RuntimeGlobalIsBrowser = '__webpack_require__.webExtRtModern'
