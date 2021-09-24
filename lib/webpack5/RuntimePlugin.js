// @ts-check
const LoadScriptRuntimeModule = require('./LoadScriptRuntimeModule')
const PublicPathRuntimeModule = require('./PublicPathModule')
const AutoPublicPathRuntimeModule = require('./AutoPublicPathRuntimeModule')
module.exports = class WebExtensionChuckLoaderRuntimePlugin {
  /**
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    const RuntimeGlobals = compiler.webpack.RuntimeGlobals

    compiler.hooks.compilation.tap(WebExtensionChuckLoaderRuntimePlugin.name, (compilation) => {
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.loadScript)
        .tap(WebExtensionChuckLoaderRuntimePlugin.name, (chunk, set) => {
          compilation.addRuntimeModule(
            chunk,
            LoadScriptRuntimeModule(
              compiler.webpack,
              compilation.outputOptions.environment && compilation.outputOptions.environment.dynamicImport
            )
          )
          return true
        })

      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.publicPath)
        .tap(WebExtensionChuckLoaderRuntimePlugin.name, (chunk, set) => {
          const { outputOptions } = compilation
          const { publicPath, scriptType } = outputOptions

          if (publicPath === 'auto') {
            const module = AutoPublicPathRuntimeModule(compiler.webpack)
            if (scriptType !== 'module') set.add(RuntimeGlobals.global)
            compilation.addRuntimeModule(chunk, module)
          } else {
            const module = PublicPathRuntimeModule(compiler.webpack)

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
