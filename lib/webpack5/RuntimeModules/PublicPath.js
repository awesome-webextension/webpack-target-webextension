// @ts-check
const BrowserRuntime = require('../BrowserRuntime')

/**
 * @param {import('webpack')} webpack
 * @returns {import('webpack').RuntimeModule}
 */
module.exports = function PublicPathRuntimeModule(webpack) {
  const { RuntimeGlobals, RuntimeModule, Template } = webpack

  class PublicPathRuntimeModule extends RuntimeModule {
    constructor() {
      super('publicPath', RuntimeModule.STAGE_BASIC)
    }
    /**
     * @returns {string} runtime code
     */
    generate() {
      const { compilation } = this
      const { publicPath } = compilation.outputOptions

      return Template.asString([
        ...BrowserRuntime,
        `var path = ${JSON.stringify(
          this.compilation.getPath(publicPath || '', {
            hash: this.compilation.hash || 'XXXX',
          })
        )}`,
        `${RuntimeGlobals.publicPath} = typeof importScripts === 'function' ? path : runtime.runtime.getURL(path);`,
      ])
    }
  }

  return new PublicPathRuntimeModule()
}
