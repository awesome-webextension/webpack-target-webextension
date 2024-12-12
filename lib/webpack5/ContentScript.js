// @ts-check
const { getInitialFiles } = require('./helper.js')

module.exports = class WebExtensionContentScriptEntryPlugin {
  /**
   * @param {import('../../index.d.ts').ContentScriptOptions} options
   */
  constructor(options) {
    this.options = options
  }
  /** @param {import('webpack').Compiler} compiler */
  apply(compiler) {
    const { WebpackError, sources, Template } = compiler.webpack
    const { experimental_output } = this.options

    compiler.hooks.thisCompilation.tap(WebExtensionContentScriptEntryPlugin.name, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: WebExtensionContentScriptEntryPlugin.name,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_DERIVED,
        },
        (assets) => {
          let manifest
          for (const entry in experimental_output) {
            const entryOption = experimental_output[entry]
            const initialFiles = getInitialFiles(compilation, entry)
            if (entryOption === false) {
              const name = JSON.stringify(entry)
              const e = new WebpackError(
                `[webpack-extension-target] Content script entry ${name} emits more than one initial file which is prohibited by options.contentScript[${name}].`
              )
              e.stack = ''
              compilation.errors.push(e)
              continue
            } else if (typeof entryOption === 'function') {
              if (!manifest) {
                const manifestAsset = assets['manifest.json']
                const name = JSON.stringify(entry)
                if (!manifestAsset) {
                  const e = new WebpackError(
                    `[webpack-extension-target] No manifest.json is emitted (required by options.contentScript[${name}]).`
                  )
                  e.stack = ''
                  compilation.errors.push(e)
                  continue
                }
                try {
                  const source = manifestAsset.source()
                  if (typeof source === 'string') manifest = JSON.parse(source)
                  else manifest = JSON.parse(source.toString('utf-8'))
                } catch {
                  const e = new WebpackError(
                    `[webpack-extension-target] Failed to parse manifest.json (required by options.contentScript[${name}]).`
                  )
                  e.stack = ''
                  e.file = 'manifest.json'
                  compilation.errors.push(e)
                  continue
                }
              }
              entryOption(manifest, initialFiles)
            } else if (typeof entryOption === 'string') {
              if (entryOption in assets) {
                const e = new WebpackError(`[webpack-extension-target] File ${entryOption} already exists.`)
                e.stack = ''
                compilation.errors.push(e)
                continue
              }
              const source = new compiler.webpack.sources.RawSource(
                Template.asString([
                  ';(async () => {',
                  Template.indent(
                    'const getURL = typeof browser === "object" ? browser.runtime.getURL : chrome.runtime.getURL;'
                  ),
                  Template.indent(initialFiles.map((x) => `await import(getURL(${JSON.stringify(x)}));`)),
                  '})();',
                  'null;',
                ])
              )
              assets[entryOption] = source
            }
          }
          if (manifest) {
            // TODO: JSON.stringify may throw
            compilation.updateAsset('manifest.json', new sources.RawSource(JSON.stringify(manifest, undefined, 4)))
          }
        }
      )
    })
  }
}
