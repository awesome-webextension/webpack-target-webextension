// @ts-check
const RuntimeGlobals = require('webpack/lib/RuntimeGlobals')
/** @type {typeof import('webpack').RuntimeModule} */
const RuntimeModule = require('webpack/lib/RuntimeModule')
const Template = require('webpack/lib/Template')
const JavascriptModulesPlugin = require('webpack/lib/javascript/JavascriptModulesPlugin')
const { getUndoPath } = require('webpack/lib/util/identifier')
const BrowserRuntime = require('./BrowserRuntime')

class AutoPublicPathRuntimeModule extends RuntimeModule {
  constructor() {
    super('publicPath', RuntimeModule.STAGE_BASIC)
  }

  /**
   * @returns {string} runtime code
   */
  generate() {
    const { compilation } = this
    const { scriptType, importMetaName } = compilation.outputOptions
    const chunkName = compilation.getPath(
      JavascriptModulesPlugin.getChunkFilenameTemplate(this.chunk, compilation.outputOptions),
      {
        chunk: this.chunk,
        contentHashType: 'javascript',
      }
    )
    // https://github.com/webpack/webpack/pull/12905
    const undoPath =
      getUndoPath.length === 2
        ? getUndoPath(chunkName, false)
        : getUndoPath(chunkName, this.compilation.outputOptions.path, false)
    return Template.asString([
      ...BrowserRuntime,
      'var scriptUrl;',
      scriptType === 'module'
        ? `if (typeof ${importMetaName}.url === "string") scriptUrl = ${importMetaName}.url`
        : Template.asString([
            `if (${RuntimeGlobals.global}.importScripts) scriptUrl = ${RuntimeGlobals.global}.location + "";`,
            `var document = ${RuntimeGlobals.global}.document;`,
            'if (!scriptUrl && document) {',
            Template.indent([`if (document.currentScript)`, Template.indent(`scriptUrl = document.currentScript.src`)]),
            '}',
          ]),
      '// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration',
      '// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.',
      'if (!scriptUrl) scriptUrl = runtime.runtime.getURL("/");',
      'scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\\?.*$/, "").replace(/\\/[^\\/]+$/, "/");',
      !undoPath
        ? `${RuntimeGlobals.publicPath} = scriptUrl;`
        : `${RuntimeGlobals.publicPath} = scriptUrl + ${JSON.stringify(undoPath)};`,
    ])
  }
}

module.exports = AutoPublicPathRuntimeModule
