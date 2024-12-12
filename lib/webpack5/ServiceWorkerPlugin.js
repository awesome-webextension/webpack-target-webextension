// @ts-check
const createEagerlyLoadChunksRuntimeModule = require('./RuntimeModules/EagerlyLoadChunks.js')
const { getInitialFiles } = require('./helper.js')

module.exports = class WebExtensionServiceWorkerEntryPlugin {
  /**
   * @param {import('../../index.d.ts').BackgroundOptions} options
   */
  constructor(options) {
    this.options = options
  }
  /** @param {import('webpack').Compiler} compiler */
  apply(compiler) {
    const { javascript, sources, WebpackError } = compiler.webpack
    const entry = this.options.serviceWorkerEntry
    if (entry === undefined) return
    const hook = compiler.hooks.entryOption
    // Set chunkLoading to import-scripts
    // @ts-ignore DO NOT add return boolean to this function, this is a BailHook and we don't want to bail.
    hook.tap(WebExtensionServiceWorkerEntryPlugin.name, (context, entries) => {
      if (typeof entries === 'function') {
        if (this.options.noDynamicEntryWarning) return
        console.warn(`[webpack-extension-target] Dynamic entry points not supported yet.
You must manually set the chuck loading of entry point ${entry} to "import-scripts".

See https://webpack.js.org/configuration/entry-context/#entry-descriptor

Set background.noDynamicEntryWarning to true to disable this warning.
`)
      }
      /** @type {import('@rspack/core').EntryDescriptionNormalized} */
      const selectedEntry = /** @type {any} */ (entries)[entry]
      if (!selectedEntry) throw new Error(`[webpack-extension-target] There is no entry called ${entry}.`)
      selectedEntry.chunkLoading = 'import-scripts'
      if ('rspack' in compiler) selectedEntry.asyncChunks = false
    })

    // Set all lazy chunks to eagerly loaded
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=1198822
    if (this.options.eagerChunkLoading !== false && !('rspack' in compiler)) {
      compiler.hooks.compilation.tap(WebExtensionServiceWorkerEntryPlugin.name, (compilation) => {
        compilation.hooks.afterOptimizeChunkIds.tap(WebExtensionServiceWorkerEntryPlugin.name, () => {
          const entryPoint = compilation.entrypoints.get(entry)
          if (!entryPoint) return
          const entryChunk = entryPoint.getEntrypointChunk()

          const children = entryPoint.getChildren()
          /** @typedef {typeof children[0]} ChunkGroup */
          /** @type {Set<ChunkGroup>} */
          const visitedChunkGroups = new Set()
          /** @type {Set<import('webpack').Chunk>} */
          const reachableChunks = new Set(entryPoint.chunks)
          collectAllChildren(entryPoint)
          const reachableChunkIds = new Set([...reachableChunks].map((x) => x.id))
          for (const id of getInitialChunkIds(entryChunk, compilation.chunkGraph, chunkHasJs)) {
            reachableChunkIds.delete(id)
          }

          if (reachableChunkIds.size) {
            const EagerlyLoadChunksRuntimeModule = createEagerlyLoadChunksRuntimeModule(compiler.webpack)
            compilation.hooks.additionalTreeRuntimeRequirements.tap(
              EagerlyLoadChunksRuntimeModule.name,
              (chunk, set) => {
                if (chunk.id !== entryChunk.id) return
                set.add(compiler.webpack.RuntimeGlobals.ensureChunkHandlers)
                compilation.addRuntimeModule(entryChunk, new EagerlyLoadChunksRuntimeModule([...reachableChunkIds]))
              }
            )
          }
          /** @param {ChunkGroup} chunkGroup */
          function collectAllChildren(chunkGroup) {
            for (const x of chunkGroup.getChildren()) {
              if (visitedChunkGroups.has(x)) continue
              else {
                visitedChunkGroups.add(x)
                x.chunks.forEach((x) => reachableChunks.add(x))
                collectAllChildren(x)
              }
            }
          }
        })
      })
    }

    const serviceWorkerEntryOutput = this.options.serviceWorkerEntryOutput
    if (
      this.options.tryCatchWrapper !== false &&
      compiler.options.output.chunkFormat !== 'module' &&
      typeof serviceWorkerEntryOutput !== 'string'
    ) {
      compiler.hooks.compilation.tap(WebExtensionServiceWorkerEntryPlugin.name, (compilation) => {
        const hooks = javascript.JavascriptModulesPlugin.getCompilationHooks(compilation)
        if (hooks.renderContent) {
          // rspack don't have it
          hooks.renderContent.tap(WebExtensionServiceWorkerEntryPlugin.name, (source, context) => {
            const entryPoint = compilation.entrypoints.get(entry)
            const entryChunk = entryPoint?.getEntrypointChunk()
            if (entryChunk !== context.chunk) return source
            return new sources.ConcatSource(
              '/******/ try { // If the initial code of the serviceWorkerEntry throws, the console cannot be opened.\n',
              source,
              '\n/******/ } catch (e) {\n/******/ 	console.error(e);\n/******/ }'
            )
          })
        }
      })
    }

    if (serviceWorkerEntryOutput !== false) {
      compiler.hooks.thisCompilation.tap(WebExtensionServiceWorkerEntryPlugin.name, (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: WebExtensionServiceWorkerEntryPlugin.name,
            stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
          },
          (assets) => {
            const initialFiles = getInitialFiles(compilation, entry)
            if (serviceWorkerEntryOutput === undefined) {
              if (initialFiles.length <= 1) return
              const e = new WebpackError(
                `
[webpack-extension-target] Webpack generates multiple initial chunks for the Service Worker entry point (${entry}). This is usually caused by splitChunks.chunks or optimization.runtimeChunk. In normal SPA/MPA builds, you need to use HtmlWebpackPlugin or ChunksWebpackPlugin to generate an HTML file to load all initial chunks, otherwise the entry point will not load.

You can set background.serviceWorkerEntryOutput: 'sw.js' to create an entry file, and change "background.service_worker" to it in your manifest.json.
You can also ignore this warning by setting background.serviceWorkerEntryOutput to false.

Here are all initial chunks for the Service Worker entry point ${entry}:
${initialFiles.map((x) => '    ' + x).join('\n')}`.trim()
              )
              e.stack = ''
              compilation.warnings.push(e)
              return
            }
            if (compiler.options.output.chunkLoading === 'import') {
              const source = new compiler.webpack.sources.RawSource(
                initialFiles.map((x) => `import ${JSON.stringify(x)};`).join('\n')
              )
              assets[serviceWorkerEntryOutput] = source
            } else {
              const code = initialFiles.map((x) => JSON.stringify(x)).join(', ')
              const source = new compiler.webpack.sources.RawSource(
                `try {\n  importScripts(${code});\n} catch (e) {\n  console.error(e);\n}`
              )
              assets[serviceWorkerEntryOutput] = source
            }
          }
        )
      })
    }
  }
}

// webpack/lib/javascript/StartupHelpers.js
/**
 * @param {import('webpack').Chunk} chunk the chunk
 * @param {import('webpack').ChunkGraph} chunkGraph the chunk graph
 * @param {function(import('webpack').Chunk, import('webpack').ChunkGraph): boolean} filterFn filter function
 * @returns {Set<number | string>} initially fulfilled chunk ids
 */
function getInitialChunkIds(chunk, chunkGraph, filterFn) {
  const initialChunkIds = new Set(chunk.ids)
  for (const c of chunk.getAllInitialChunks()) {
    if (c === chunk || filterFn(c, chunkGraph) || !c.ids) continue
    for (const id of c.ids) initialChunkIds.add(id)
  }
  return initialChunkIds
}

// webpack/lib/javascript/JavascriptModulesPlugin.js
/**
 * @param {import('webpack').Chunk} chunk a chunk
 * @param {import('webpack').ChunkGraph} chunkGraph the chunk graph
 * @returns {boolean} true, when a JS file is needed for this chunk
 */
function chunkHasJs(chunk, chunkGraph) {
  if (chunkGraph.getNumberOfEntryModules(chunk) > 0) return true
  return !!chunkGraph.getChunkModulesIterableBySourceType(chunk, 'javascript')
}
