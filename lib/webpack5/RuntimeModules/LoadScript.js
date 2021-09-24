// @ts-check
const BrowserRuntime = require('../BrowserRuntime')

// import()
const DYNAMIC_IMPORT_LOADER = 'dynamicImportLoader'
// createElement('script')
const DOM_LOADER = 'scriptLoader'
// importScripts
const WORKER_LOADER = 'workerLoader'
// browser.runtime.sendMessage()
const CLASSIC_LOADER = 'classicLoader'
const CLASSIC_SUPPORT = '__send__'
// fallback choice when DYNAMIC_IMPORT_LOADER fails
const FALLBACK_LOADER = 'fallbackLoader'

/**
 * @param {import('webpack')} webpack
 * @param {boolean | undefined} supportDynamicImport
 * @param {boolean | undefined} classicLoaderEnabled
 * @returns {import('webpack').RuntimeModule}
 */
module.exports = function LoadScriptRuntimeModule(webpack, supportDynamicImport, classicLoaderEnabled) {
  const { Template, RuntimeGlobals, RuntimeModule } = webpack
  class LoadScriptRuntimeModule extends RuntimeModule {
    constructor() {
      super('load script')
      this.supportDynamicImport = Boolean(supportDynamicImport)
      this.classicLoaderEnabled = Boolean(classicLoaderEnabled)
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
      const DynamicImportLoader =
        `var ${DYNAMIC_IMPORT_LOADER} = ` +
        this.f('url, done, chunkId', [
          `import(url).then(() => done(), ${this.f('e', [
            `console.warn('jsonp chunk loader failed to use dynamic import.', e)`,
            `${FALLBACK_LOADER}(url, done, chunkId)`,
          ])})`,
        ])
      const DOMLoader =
        `var ${DOM_LOADER} = ` +
        this.f('url, done, chunkId', [
          `var script = document.createElement('script')`,
          `script.src = url`,
          `script.onload = done`,
          `script.onerror = done`,
          `document.body.appendChild(script)`,
        ])
      const WorkerLoader =
        `var ${WORKER_LOADER} = ` +
        this.f('url, done, chunkId', [`try { importScripts(url); done() } catch (e) { done(e) }`])
      const ClassicLoader =
        `var ${CLASSIC_LOADER} = ` +
        this.f('url, done, chunkId', [
          `${CLASSIC_SUPPORT}({ type: 'WTW_INJECT', file: url }).then(done, (e) => done(Object.assign(e, { type: 'missing' })))`,
        ])
      const ClassicLoaderSupport =
        `var ${CLASSIC_SUPPORT} = ` +
        this.f('msg', [
          `if (isBrowser) return runtime.runtime.sendMessage(msg)`,
          `return new Promise(r => runtime.runtime.sendMessage(msg, r))`,
        ])
      const ClassicLoaderDisabled =
        `var ${CLASSIC_LOADER} = ` + this.f('', ['throw new Error("No loader for content script is found. You must set output.environment.dynamicImport to enable ES Module loader, or specify the background entry in your webpack config to enable the classic loader.")'])
      return Template.asString([
        ...BrowserRuntime,

        this.classicLoaderEnabled ? ClassicLoaderSupport : '',
        this.classicLoaderEnabled ? ClassicLoader : ClassicLoaderDisabled,

        this.supportDynamicImport ? DynamicImportLoader : '',

        DOMLoader,
        WorkerLoader,

        `var isWorker = typeof importScripts === 'function'`,
        // extension page
        `if (location.protocol.includes('-extension:')) ${RuntimeGlobals.loadScript} = isWorker ? ${WORKER_LOADER} : ${DOM_LOADER}`,
        // content script
        `else if (!isWorker) ${RuntimeGlobals.loadScript} = ${CLASSIC_LOADER}`,
        // worker in content script
        `else { throw new TypeError('Unable to determinate the chunk loader: content script + Worker') }`,

        this.supportDynamicImport ? `var ${FALLBACK_LOADER} = ${RuntimeGlobals.loadScript}` : '',
        this.supportDynamicImport ? `${RuntimeGlobals.loadScript} = ${DYNAMIC_IMPORT_LOADER}` : '',
        // `${RuntimeGlobals.loadScript} = new Proxy(${RuntimeGlobals.loadScript}, { apply(t, _, a) { console.log(...a); return t(...a) } })`,
      ].filter(Boolean))
    }
  }
  return new LoadScriptRuntimeModule()
}
