// @ts-check
const RuntimeGlobals = require('webpack/lib/RuntimeGlobals')
const LoadScriptRuntimeModule = require('./LoadScriptRuntimeModule')
const PublicPathRuntimeModule = require('./PublicPathModule')
const AutoPublicPathRuntimeModule = require('./AutoPublicPathRuntimeModule')
module.exports = class WebExtensionChuckLoaderRuntimePlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(WebExtensionChuckLoaderRuntimePlugin.name, (compilation) => {
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.loadScript)
        .tap(WebExtensionChuckLoaderRuntimePlugin.name, (chunk, set) => {
          compilation.addRuntimeModule(chunk, new LoadScriptRuntimeModule())
          return true
        })

      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.publicPath)
        .tap(WebExtensionChuckLoaderRuntimePlugin.name, (chunk, set) => {
          const { outputOptions } = compilation
          const { publicPath, scriptType } = outputOptions

          if (publicPath === 'auto') {
            const module = new AutoPublicPathRuntimeModule()
            if (scriptType !== 'module') set.add(RuntimeGlobals.global)
            compilation.addRuntimeModule(chunk, module)
          } else {
            const module = new PublicPathRuntimeModule()

            if (typeof publicPath !== 'string' || /\[(full)?hash\]/.test(publicPath)) {
              module.fullHash = true
            }

            compilation.addRuntimeModule(chunk, module)
          }
          return true
        })
    })
  }
}
