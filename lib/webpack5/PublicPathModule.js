// @ts-check
const { Template } = require('webpack')
const RuntimeGlobals = require('webpack/lib/RuntimeGlobals')
const RuntimeModule = require('webpack/lib/RuntimeModule')
const BrowserRuntime = require('./BrowserRuntime')

class PublicPathRuntimeModule extends RuntimeModule {
  constructor() {
    super('publicPath', RuntimeModule.STAGE_BASIC)
  }
  _runtime() {
    return [`var isBrowser = typeof browser === 'object'`, `var runtime = isBrowser ? browser : chrome`]
  }
  f(args, body) {
    return this.compilation.runtimeTemplate.basicFunction(args, body)
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

module.exports = PublicPathRuntimeModule
