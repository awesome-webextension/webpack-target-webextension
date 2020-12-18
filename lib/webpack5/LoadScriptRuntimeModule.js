// @ts-check
const RuntimeGlobals = require('webpack/lib/RuntimeGlobals')
const Template = require('webpack/lib/Template')
const HelperRuntimeModule = require('webpack/lib/runtime/HelperRuntimeModule')

class LoadScriptRuntimeModule extends HelperRuntimeModule {
  constructor() {
    super('load script')
  }

  /**
   * @returns {string} runtime code
   */
  generate() {
    return Template.asString([
      `var isBrowser = typeof browser === 'object'`,
      `var runtime = isBrowser ? browser : chrome`,
      `var send = ` +
        this.compilation.runtimeTemplate.basicFunction('msg', [
          `if (isBrowser) return runtime.runtime.sendMessage(msg)`,
          `return new Promise(r => runtime.runtime.sendMessage(msg, r))`,
        ]),
      `var contentScriptLoader = ` +
        this.compilation.runtimeTemplate.basicFunction('url, done, chunkId', [
          `send({ type: 'WTW_INJECT', file: url }).then(done, (e) => done(Object.assign(e, { type: 'missing' })))`,
        ]),
      `var normalLoader = ` +
        this.compilation.runtimeTemplate.basicFunction('url, done, chunkId', [
          `var script = document.createElement('script')`,
          `script.src = url`,
          `script.onload = done`,
          `script.onerror = done`,
          `document.body.appendChild(script)`,
        ]),
      `var workerLoader = ` +
        this.compilation.runtimeTemplate.basicFunction('url, done, chunkId', [
          `try { importScripts(url); done() } catch (e) { done(e) }`,
        ]),
      `var isWorker = typeof importScripts === 'function'`,
      // extension page
      `if (location.protocol.includes('-extension:')) ${RuntimeGlobals.loadScript} = isWorker ? workerLoader : normalLoader`,
      // content script
      `else if (!isWorker) ${RuntimeGlobals.loadScript} = contentScriptLoader`,
      // worker in content script
      `else { throw new TypeError('Worker in content script not supported yet, please open a new issue in https://github.com/crimx/webpack-target-webextension') }`,
    ])
  }
}

module.exports = LoadScriptRuntimeModule
