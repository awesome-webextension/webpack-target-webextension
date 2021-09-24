// @ts-check
const BrowserRuntime = require('../BrowserRuntime')

/**
 * @param {import('webpack')} webpack
 * @param {boolean | undefined} supportDynamicImport
 * @returns {import('webpack').RuntimeModule}
 */
module.exports = function LoadScriptRuntimeModule(webpack, supportDynamicImport) {
  const { Template, RuntimeGlobals, RuntimeModule } = webpack
  class LoadScriptRuntimeModule extends RuntimeModule {
    constructor() {
      super('load script')
      this.supportDynamicImport = Boolean(supportDynamicImport)
    }
    /**
     * @param {string} args
     * @param {string[]} body
     */
    f(args, body) {
      return this.compilation.runtimeTemplate.basicFunction(args, body)
    }
    /**
     * @returns {string} runtime code
     */
    generate() {
      return Template.asString([
        ...BrowserRuntime,
        `var send = ` +
          this.f('msg', [
            `if (isBrowser) return runtime.runtime.sendMessage(msg)`,
            `return new Promise(r => runtime.runtime.sendMessage(msg, r))`,
          ]),
        this.supportDynamicImport
          ? `var dynamicImportLoader = ` +
            this.f('url, done, chunkId', [
              `import(url).then(() => done(), ${this.f('e', [
                `console.warn('jsonp chunk loader failed to use dynamic import.', e)`,
                `fallbackLoader(url, done, chunkId)`,
              ])})`,
            ])
          : '',
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
        `else { throw new TypeError('Unreachable loader: content script + Worker') }`,
        this.supportDynamicImport ? `var fallbackLoader = ${RuntimeGlobals.loadScript}` : '',
        this.supportDynamicImport ? `${RuntimeGlobals.loadScript} = dynamicImportLoader` : '',
        // `${RuntimeGlobals.loadScript} = new Proxy(${RuntimeGlobals.loadScript}, { apply(t, _, a) { console.log(...a); return t(...a) } })`,
      ])
    }
  }
  return new LoadScriptRuntimeModule()
}
