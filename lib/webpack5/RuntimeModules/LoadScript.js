// @ts-check
const { TemplateFn } = require('../helper.js')
const BrowserRuntime = require('./BrowserRuntime.js')

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
     * @returns {string} runtime code
     */
    generate() {
      const f = TemplateFn(this.compilation, Template)
      const DynamicImportLoader =
        `var ${DYNAMIC_IMPORT_LOADER} = ` +
        f('url, done, key, chunkId', [
          `import(url).then(${f('', [
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
          ])}, ${f('e', [
            `console.warn('Dynamic import loader failed. Using fallback loader (see https://github.com/awesome-webextension/webpack-target-webextension#content-script).', e)`,
            `${FALLBACK_LOADER}(url, done, key, chunkId)`,
          ])})`,
        ])
      const DOMLoader =
        `var ${DOM_LOADER} = ` +
        f('url, done', [
          `var script = document.createElement('script')`,
          `script.src = url`,
          `script.onload = done`,
          `script.onerror = done`,
          `document.body.appendChild(script)`,
        ])
      const WorkerLoader =
        `var ${WORKER_LOADER} = ` + f('url, done', [`try { importScripts(url); done() } catch (e) { done(e) }`])
      const ClassicLoader =
        `var ${CLASSIC_LOADER} = ` +
        f('url, done', [
          `${CLASSIC_SUPPORT}({ type: 'WTW_INJECT', file: url }).then(done, (e) => done(Object.assign(e, { type: 'missing' })))`,
        ])
      const ClassicLoaderSupport =
        `var ${CLASSIC_SUPPORT} = ` +
        f('msg', [
          `if (isBrowser) return ${BrowserRuntime.RuntimeGlobal}.runtime.sendMessage(msg)`,
          `return new Promise(r => ${BrowserRuntime.RuntimeGlobal}.runtime.sendMessage(msg, r))`,
        ])
      const ClassicLoaderDisabled =
        `var ${CLASSIC_LOADER} = ` +
        f('', [
          `throw new Error("[webpack-target-webextension] Failed to load async chunk in the content script. No script loader is found. You can either\\n - Set output.environment.dynamicImport to true if your environment supports native ES Module\\n - Specify the background entry to enable the fallback loader\\n - Set module.parser.javascript.dynamicImportMode to 'eager' to inline all async chunks.")`,
        ])
      const rspack = 'rspack' in this.compilation.compiler
      return Template.asString(
        [
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
          // our runtime module cannot override rspack builtin, therefore we define it as a getter on rspack.
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
