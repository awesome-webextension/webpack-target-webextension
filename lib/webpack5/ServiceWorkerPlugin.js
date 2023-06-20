// @ts-check
const EagerlyLoadChunksRuntimeModule = require('./RuntimeModules/EagerlyLoadChunks')
module.exports = class ServiceWorkerEntryPlugin {
  /**
   * @param {import('../..').BackgroundOptions} options
   * @param {string} entry
   */
  constructor(options, entry) {
    this.options = options
    this.entry = entry
  }
  /** @param {import('webpack').Compiler} compiler */
  apply(compiler) {
    const hook = compiler.hooks.entryOption
    // Set chunkLoading to import-scripts
    // @ts-ignore DO NOT add return boolean to this function, this is a BailHook and we don't want to bail.
    hook.tap(ServiceWorkerEntryPlugin.name, (context, entries) => {
      if (typeof entries === 'function') {
        if (this.options.noWarningDynamicEntry) return
        console.warn(`[webpack-extension-target] Dynamic entry points not supported yet.
You must manually set the chuck loading of entry point ${this.entry} to "import-scripts".

See https://webpack.js.org/configuration/entry-context/#entry-descriptor

Set background.noWarningDynamicEntry to true to disable this warning.
`)
      }
      const selectedEntry = entries[this.entry]
      if (!selectedEntry) throw new Error(`[webpack-extension-target] There is no entry called ${this.entry}.`)
      selectedEntry.chunkLoading = 'import-scripts'
    })

    // Set all lazy chunks to eagerly loaded
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=1198822
    if (this.options.eagerChunkLoading !== false) {
      compiler.hooks.compilation.tap(ServiceWorkerEntryPlugin.name, (compilation) => {
        compilation.hooks.afterOptimizeChunkIds.tap(ServiceWorkerEntryPlugin.name, () => {
          const entryPoint = compilation.entrypoints.get(this.entry)
          if (!entryPoint) return

          const children = entryPoint.getChildren()
          /** @typedef {typeof children[0]} ChunkGroup */
          /** @type {Set<ChunkGroup>} */
          const visitedChunkGroups = new Set()
          /** @type {Set<import('webpack').Chunk>} */
          const reachableChunks = new Set(entryPoint.chunks)
          collectAllChildren(entryPoint)

          if (reachableChunks.size) {
            compilation.addRuntimeModule(
              entryPoint.getEntrypointChunk(),
              EagerlyLoadChunksRuntimeModule(compiler.webpack, compilation, [...reachableChunks].map(x => x.id))
            )
          }
          /** @param {ChunkGroup} chunkGroup */
          function collectAllChildren(chunkGroup) {
            for (const x of chunkGroup.getChildren()) {
              if (visitedChunkGroups.has(x)) continue
              else {
                visitedChunkGroups.add(x)
                x.chunks.forEach(x => reachableChunks.add(x))
                collectAllChildren(x)
              }
            }
          }
        })
      })
    }
  }
}
