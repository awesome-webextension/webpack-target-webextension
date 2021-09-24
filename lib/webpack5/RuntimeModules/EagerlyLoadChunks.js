/**
 * @param {import('webpack')} webpack
 * @param {string[]} chunks
 */
module.exports = function EagerlyLoadChunksRuntimeModule(webpack, chunks) {
  const { RuntimeGlobals, RuntimeModule, Template } = webpack
  class EagerlyLoadChunksRuntimeModule extends RuntimeModule {
    constructor() {
      super('eagerly load chunks', 2000)
    }
    generate() {
      return Template.asString([chunks.map((x) => `${RuntimeGlobals.ensureChunk}(${JSON.stringify(x)});`)])
    }
  }
  return new EagerlyLoadChunksRuntimeModule()
}
