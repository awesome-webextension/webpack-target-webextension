// @ts-check
const LoadScriptRuntimeModule = require('./RuntimeModules/LoadScript')
const PublicPathRuntimeModule = require('./RuntimeModules/PublicPath')
const AutoPublicPathRuntimeModule = require('./RuntimeModules/AutoPublicPath')
const ChunkLoaderFallbackRuntimeModule = require('./RuntimeModules/ChunkLoaderFallback')

module.exports = class WebExtensionChuckLoaderRuntimePlugin {
  /** @param {undefined | import('../../index.d.ts').BackgroundOptions} options */
  constructor(options, weakRuntimeCheck) {
    this.options = options
    this.weakRuntimeCheck = weakRuntimeCheck
  }
  /** @param {import('webpack').Compiler} compiler */
  apply(compiler) {
    const { RuntimeGlobals } = compiler.webpack
    const { options } = this

    compiler.hooks.compilation.tap(WebExtensionChuckLoaderRuntimePlugin.name, (compilation) => {
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.loadScript)
        .tap(WebExtensionChuckLoaderRuntimePlugin.name, (chunk) => {
          compilation.addRuntimeModule(
            chunk,
            LoadScriptRuntimeModule(
              compiler.webpack,
              compilation.outputOptions.environment && compilation.outputOptions.environment.dynamicImport,
              options && options.classicLoader !== false,
              this.weakRuntimeCheck
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
            const module = AutoPublicPathRuntimeModule(compiler.webpack, this.weakRuntimeCheck)
            if (scriptType !== 'module') set.add(RuntimeGlobals.global)
            compilation.addRuntimeModule(chunk, module)
          } else {
            const module = PublicPathRuntimeModule(compiler.webpack, this.weakRuntimeCheck)

            if (typeof publicPath !== 'string' || /\[(full)?hash\]/.test(publicPath)) {
              module.fullHash = true
            }

            compilation.addRuntimeModule(chunk, module)
          }
          return true
        })

      if (options && options.classicLoader !== false) {
        compilation.hooks.afterChunks.tap(WebExtensionChuckLoaderRuntimePlugin.name, () => {
          const { entry, pageEntry, serviceWorkerEntry } = options
          const entryPoint = entry && compilation.entrypoints.get(entry)
          const entryPoint2 = pageEntry && compilation.entrypoints.get(pageEntry)
          const entryPoint3 = serviceWorkerEntry && compilation.entrypoints.get(serviceWorkerEntry)

          for (const entry of [entryPoint, entryPoint2, entryPoint3]) {
            if (!entry) continue
            compilation.addRuntimeModule(entry.chunks[0], ChunkLoaderFallbackRuntimeModule(compiler.webpack))
          }
        })
      }
    })
  }
}
