// @ts-check
const BrowserRuntime = require('../BrowserRuntime')

/**
 *
 * @param {import('webpack')} webpack
 * @returns {import('webpack').RuntimeModule}
 */
module.exports = function AutoPublicPathRuntimeModule(webpack) {
  const {
    RuntimeModule,
    RuntimeGlobals,
    Template,
    javascript: { JavascriptModulesPlugin },
  } = webpack
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
      const outputPath = this.compilation.outputOptions.path
      if (!outputPath)
        return Template.asString('/** Auto public path does not works because no output path is found. */')
      const undoPath = getUndoPath(chunkName, outputPath, false)
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
  return new AutoPublicPathRuntimeModule()
}

/**
 * The following function (from webpack/lib/util/identifier) is not exported by Webpack 5 as a public API.
 * To not import anything from Webpack directly, this function is copied here.
 *
 * It follows the MIT license.
 *
 * @param {string} filename the filename which should be undone
 * @param {string} outputPath the output path that is restored (only relevant when filename contains "..")
 * @param {boolean} enforceRelative true returns ./ for empty paths
 * @returns {string} repeated ../ to leave the directory of the provided filename to be back on output dir
 */
function getUndoPath(filename, outputPath, enforceRelative) {
  let depth = -1
  let append = ''
  outputPath = outputPath.replace(/[\\/]$/, '')
  for (const part of filename.split(/[/\\]+/)) {
    if (part === '..') {
      if (depth > -1) {
        depth--
      } else {
        const i = outputPath.lastIndexOf('/')
        const j = outputPath.lastIndexOf('\\')
        const pos = i < 0 ? j : j < 0 ? i : Math.max(i, j)
        if (pos < 0) return outputPath + '/'
        append = outputPath.slice(pos + 1) + '/' + append
        outputPath = outputPath.slice(0, pos)
      }
    } else if (part !== '.') {
      depth++
    }
  }
  return depth > 0 ? `${'../'.repeat(depth)}${append}` : enforceRelative ? `./${append}` : append
}
