// @ts-check
const RuntimeGlobals = require('webpack/lib/RuntimeGlobals')
const LoadScriptRuntimeModule = require('./LoadScriptRuntimeModule')
module.exports = class WebExtensionChuckLoaderRuntimePlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(WebExtensionChuckLoaderRuntimePlugin.name, (compilation) => {
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.loadScript)
        .tap(WebExtensionChuckLoaderRuntimePlugin.name, (chunk, set) => {
          compilation.addRuntimeModule(chunk, new LoadScriptRuntimeModule())
          return true
        })
    })
  }
}
