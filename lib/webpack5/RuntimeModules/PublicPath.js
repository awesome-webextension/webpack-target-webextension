// @ts-check
const BrowserRuntime = require('../BrowserRuntime')

/**
 * @param {import('webpack')} webpack
 * @param {boolean} acceptWeak
 * @returns {import('webpack').RuntimeModule}
 */
module.exports = function PublicPathRuntimeModule(webpack, acceptWeak) {
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
      if (!compilation)
        return Template.asString(
          '/* [webpack-target-webextension] PublicPathRuntimeModule skipped because no compilation is found. */'
        )
      const { publicPath } = compilation.outputOptions

      return Template.asString([
        ...BrowserRuntime(acceptWeak),
        `var path = ${JSON.stringify(
          compilation.getPath(publicPath || '', {
            hash: compilation.hash || 'XXXX',
          })
        )}`,
        `${RuntimeGlobals.publicPath} = typeof importScripts === 'function' ? path : runtime.runtime.getURL(path);`,
      ])
    }
  }

  return new PublicPathRuntimeModule()
}
