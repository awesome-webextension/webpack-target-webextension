// @ts-check
<<<<<<< Updated upstream
const RuntimeGlobals = require('webpack/lib/RuntimeGlobals')
/** @type {typeof import('webpack').RuntimeModule} */
const RuntimeModule = require('webpack/lib/RuntimeModule')
const Template = require('webpack/lib/Template')
const JavascriptModulesPlugin = require('webpack/lib/javascript/JavascriptModulesPlugin')
const { getUndoPath } = require('webpack/lib/util/identifier')
||||||| constructed merge base
const RuntimeGlobals = require('webpack/lib/RuntimeGlobals')
const RuntimeModule = require('webpack/lib/RuntimeModule')
const Template = require('webpack/lib/Template')
const JavascriptModulesPlugin = require('webpack/lib/javascript/JavascriptModulesPlugin')
const { getUndoPath } = require('webpack/lib/util/identifier')
=======
>>>>>>> Stashed changes
const BrowserRuntime = require('./BrowserRuntime')
const { getUndoPath } = require('./utils')
/**
 * @param {import('webpack').Compiler} compiler
 */
module.exports = function CreateAutoPublicPathRuntimeModule(compiler) {
  const { RuntimeGlobals, Template, JavascriptModulesPlugin } = compiler.webpack
  return class AutoPublicPathRuntimeModule extends compiler.webpack.RuntimeModule {
    constructor() {
      super('publicPath', compiler.webpack.RuntimeModule.STAGE_BASIC)
    }

    /**
     * @returns {string} runtime code
     */
    generate() {
      const { compilation } = this
      const { scriptType, importMetaName, path } = compilation.outputOptions
      const chunkName = compilation.getPath(
        JavascriptModulesPlugin.getChunkFilenameTemplate(this.chunk, compilation.outputOptions),
        {
          chunk: this.chunk,
          contentHashType: 'javascript',
        }
      )
      const undoPath = getUndoPath(chunkName, path, false)

      return Template.asString([
        ...BrowserRuntime,
        'var scriptUrl;',
        scriptType === 'module'
          ? `if (typeof ${importMetaName}.url === "string") scriptUrl = ${importMetaName}.url`
          : Template.asString([
              `if (${RuntimeGlobals.global}.importScripts) scriptUrl = ${RuntimeGlobals.global}.location + "";`,
              `var document = ${RuntimeGlobals.global}.document;`,
              'if (!scriptUrl && document) {',
              Template.indent([
                `if (document.currentScript)`,
                Template.indent(`scriptUrl = document.currentScript.src`),
              ]),
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
}
