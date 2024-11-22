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
 * @param {boolean} acceptWeak
 * @param {boolean} rspack
 * @returns {import('webpack').RuntimeModule}
 */
module.exports = function LoadScriptRuntimeModule(
  webpack,
  supportDynamicImport,
  classicLoaderEnabled,
  acceptWeak,
  rspack
) {
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
      if (!this.compilation) throw new TypeError('No compilation is found.')
      if (this.compilation.runtimeTemplate) return this.compilation.runtimeTemplate.basicFunction(args, body)

      // rspack
      return this.compilation.outputOptions.environment.arrowFunction
        ? `(${args}) => {\n${Template.indent(body)}\n}`
        : `function(${args}) {\n${Template.indent(body)}\n}`
    }
    /**
     * @returns {string} runtime code
     */
    generate() {
      const DynamicImportLoader =
        `var ${DYNAMIC_IMPORT_LOADER} = ` +
        this.f('url, done, key, chunkId', [
          `import(url).then(${this.f('', [
            `if (isNotIframe) return done()`,
            `try {`,
            Template.indent([
              `// It's a Chrome bug, if the import() is called in a sandboxed iframe, it _fails_ the script loading but _resolve_ the Promise.`,
              `// we call ${RuntimeGlobals.ensureChunkHandlers}.j(chunkId) to check if it is loaded.`,
              `// if it is, this is a no-op. if it is not, it will throw a TypeError because this function requires 2 parameters.`,
              `// This call will not trigger the chunk loading because it is already loading.`,
              `// see https://github.com/awesome-webextension/webpack-target-webextension/issues/41`,
              `chunkId !== undefined && ${RuntimeGlobals.ensureChunkHandlers}.j(chunkId)`,
              `done()`,
            ]),
            `}`,
            `catch {`,
            Template.indent([
              `if (!bug816121warned) {`,
              Template.indent(['console.warn("Chrome bug https://crbug.com/816121 hit.")', 'bug816121warned = true']),
              `}`,
              `return ${FALLBACK_LOADER}(url, done, key, chunkId)`,
            ]),
            `}`,
          ])}, ${this.f('e', [
            `console.warn('Dynamic import loader failed. Using fallback loader (see https://github.com/awesome-webextension/webpack-target-webextension#content-script).', e)`,
            `${FALLBACK_LOADER}(url, done, key, chunkId)`,
          ])})`,
        ])
      const DOMLoader =
        `var ${DOM_LOADER} = ` +
        this.f('url, done', [
          `var script = document.createElement('script')`,
          `script.src = url`,
          `script.onload = done`,
          `script.onerror = done`,
          `document.body.appendChild(script)`,
        ])
      const WorkerLoader =
        `var ${WORKER_LOADER} = ` + this.f('url, done', [`try { importScripts(url); done() } catch (e) { done(e) }`])
      const ClassicLoader =
        `var ${CLASSIC_LOADER} = ` +
        this.f('url, done', [
          `${CLASSIC_SUPPORT}({ type: 'WTW_INJECT', file: url }).then(done, (e) => done(Object.assign(e, { type: 'missing' })))`,
        ])
      const ClassicLoaderSupport =
        `var ${CLASSIC_SUPPORT} = ` +
        this.f('msg', [
          `if (isBrowser) return runtime.runtime.sendMessage(msg)`,
          `return new Promise(r => runtime.runtime.sendMessage(msg, r))`,
        ])
      const ClassicLoaderDisabled =
        `var ${CLASSIC_LOADER} = ` +
        this.f('', [
          `throw new Error("[webpack-target-webextension] Failed to load async chunk in the content script. No script loader is found. You can either\\n - Set output.environment.dynamicImport to true if your environment supports native ES Module\\n - Specify the background entry to enable the fallback loader\\n - Set module.parser.javascript.dynamicImportMode to 'eager' to inline all async chunk")`,
        ])
      return Template.asString(
        [
          ...BrowserRuntime(acceptWeak),

          this.supportDynamicImport ? `var bug816121warned, isNotIframe` : undefined,
          this.supportDynamicImport
            ? `try { isNotIframe = typeof window === "object" ? window.top === window : true } catch(e) { isInIframe = false /* CORS error */ }`
            : undefined,

          this.classicLoaderEnabled ? ClassicLoaderSupport : '',
          this.classicLoaderEnabled ? ClassicLoader : ClassicLoaderDisabled,

          this.supportDynamicImport ? DynamicImportLoader : '',

          DOMLoader,
          WorkerLoader,

          `var isWorker = typeof importScripts === 'function'`,
          // extension page
          `if (typeof location === 'object' && location.protocol.includes('-extension:')) ${RuntimeGlobals.loadScript} = isWorker ? ${WORKER_LOADER} : ${DOM_LOADER}`,
          // content script
          `else if (!isWorker) ${RuntimeGlobals.loadScript} = ${CLASSIC_LOADER}`,
          // worker in content script
          `else { throw new TypeError('Unable to determinate the chunk loader: content script + Worker') }`,

          this.supportDynamicImport ? `var ${FALLBACK_LOADER} = ${RuntimeGlobals.loadScript}` : '',
          this.supportDynamicImport ? `${RuntimeGlobals.loadScript} = ${DYNAMIC_IMPORT_LOADER}` : '',
          rspack ? 'var finalLoader = ' + RuntimeGlobals.loadScript : '',
          rspack
            ? `Object.defineProperty(${RuntimeGlobals.require}, "l", { configurable: true, get() { return finalLoader }, set() {} })`
            : '',
        ].filter(Boolean)
      )
    }
  }
  return new LoadScriptRuntimeModule()
}
