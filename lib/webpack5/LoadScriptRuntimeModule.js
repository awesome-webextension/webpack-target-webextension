// @ts-check
const RuntimeGlobals = require('webpack/lib/RuntimeGlobals')
const Template = require('webpack/lib/Template')
const HelperRuntimeModule = require('webpack/lib/runtime/HelperRuntimeModule')

class LoadScriptRuntimeModule extends HelperRuntimeModule {
  constructor() {
    super('load script')
  }
  _runtime() {
    return [`var isBrowser = typeof browser === 'object'`, `var runtime = isBrowser ? browser : chrome`]
  }
  publicPathRewrite() {
    const prop = RuntimeGlobals.publicPath.replace(RuntimeGlobals.require + '.', '')
    return Template.asString([
      `let orig = ${RuntimeGlobals.publicPath} || ''`,
      `Object.defineProperty(${RuntimeGlobals.require}, '${prop}', {`,
      Template.indent([
        `configurable: true,`,
        `get: ${this.f('', [`return runtime.runtime.getURL(orig)`])},`,
        `set: ${this.f('v', [`orig = String(v)`])}`,
      ]),
      `})`,
    ])
  }
  f(args, body) {
    return this.compilation.runtimeTemplate.basicFunction(args, body)
  }
  /**
   * @returns {string} runtime code
   */
  generate() {
    return Template.asString([
      ...this._runtime(),
      `var send = ` +
        this.f('msg', [
          `if (isBrowser) return runtime.runtime.sendMessage(msg)`,
          `return new Promise(r => runtime.runtime.sendMessage(msg, r))`,
        ]),
      `var contentScriptLoader = ` +
        this.f('url, done, chunkId', [
          `send({ type: 'WTW_INJECT', file: url }).then(done, (e) => done(Object.assign(e, { type: 'missing' })))`,
        ]),
      `var normalLoader = ` +
        this.f('url, done, chunkId', [
          `var script = document.createElement('script')`,
          `script.src = url`,
          `script.onload = done`,
          `script.onerror = done`,
          `document.body.appendChild(script)`,
        ]),
      `var workerLoader = ` +
        this.f('url, done, chunkId', [`try { importScripts(url); done() } catch (e) { done(e) }`]),
      `var isWorker = typeof importScripts === 'function'`,
      // extension page
      `if (location.protocol.includes('-extension:')) ${RuntimeGlobals.loadScript} = isWorker ? workerLoader : normalLoader`,
      // content script
      `else if (!isWorker) ${RuntimeGlobals.loadScript} = contentScriptLoader`,
      // worker in content script
      `else { throw new TypeError('Worker in content script not supported yet, please open a new issue in https://github.com/crimx/webpack-target-webextension') }`,
      // `${RuntimeGlobals.loadScript} = new Proxy(${RuntimeGlobals.loadScript}, { apply(t, _, a) { console.log(...a); return t(...a) } })`,
      this.publicPathRewrite(),
    ])
  }
}

module.exports = LoadScriptRuntimeModule
