// @ts-check
module.exports = class WebExtensionContentScriptEntryPlugin {
  /**
   * @param {import('../../index.js').WebExtensionPluginOptions} options
   */
  constructor(options) {
    this.options = options
  }
  /** @param {import('webpack').Compiler} compiler */
  apply(compiler) {
    const { WebpackError, sources, Template } = compiler.webpack
    const { experimental_output } = this.options
    if (!experimental_output) return
    {
      const sw = this.options.background?.serviceWorkerEntry
      if (sw && sw in experimental_output && typeof experimental_output[sw] === 'function') {
        throw new Error(
          `[webpack-extension-target] options.experimental_output[${JSON.stringify(
            sw
          )}] cannot be a function because it is a service worker entry. Use { file, touch(manifest, file) { manifest.background.service_worker = file; } } instead.`
        )
      }
    }

    compiler.hooks.thisCompilation.tap(WebExtensionContentScriptEntryPlugin.name, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: WebExtensionContentScriptEntryPlugin.name,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_DERIVED,
        },
        (assets) => {
          let manifest
          const serviceWorkerEntry = this.options.background?.serviceWorkerEntry
          {
            if (
              serviceWorkerEntry &&
              !(serviceWorkerEntry in experimental_output) &&
              (getInitialFiles(compilation, serviceWorkerEntry)?.length || 0) > 1
            ) {
              const e = new WebpackError(
                `[webpack-extension-target] Entry ${JSON.stringify(
                  serviceWorkerEntry
                )} is not specified in options.experimental_output.`
              )
              e.stack = ''
              compilation.warnings.push(e)
            }
          }
          for (const entry in experimental_output) {
            const isBackgroundEntry = entry === serviceWorkerEntry
            const entryOption = experimental_output[entry]
            const initialFiles = getInitialFiles(compilation, entry)
            if (!initialFiles || initialFiles.length === 0) {
              const name = JSON.stringify(entry)
              const e = new WebpackError(
                initialFiles
                  ? `[webpack-extension-target] Entry ${name} does not emit any initial file (specified in options.experimental_output).`
                  : `[webpack-extension-target] Entry ${name} does not exist (specified in options.experimental_output).`
              )
              e.stack = ''
              compilation.errors.push(e)
              continue
            }

            if (entryOption === false) {
              if (initialFiles.length > 1) {
                const name = JSON.stringify(entry)
                const e = new WebpackError(
                  `[webpack-extension-target] Entry ${name} emits more than one initial file which is prohibited (specified in options.experimental_output).`
                )
                e.stack = ''
                compilation.errors.push(e)
              }
              continue
            }

            function emitFile(/** @type {string} */ entryOption, /** @type {string[]} */ initialFiles) {
              if (entryOption in assets) {
                const e = new WebpackError(
                  `[webpack-extension-target] Cannot override an existing file ${JSON.stringify(
                    entryOption
                  )} (specified by options.experimental_output[${JSON.stringify(entry)}]).`
                )
                e.stack = ''
                compilation.errors.push(e)
                return
              }
              const source = new compiler.webpack.sources.RawSource(
                Template.asString(
                  isBackgroundEntry
                    ? [
                        'try {',
                        Template.indent(
                          'importScripts(' + initialFiles.map((file) => JSON.stringify(file)).join(', ') + ');'
                        ),
                        '} catch (e) {',
                        Template.indent('console.error(e);'),
                        '}',
                      ]
                    : [
                        ';(() => {',
                        Template.indent([
                          'const getURL = typeof browser === "object" ? browser.runtime.getURL : chrome.runtime.getURL;',
                          `${JSON.stringify(initialFiles)}.forEach(file => import(getURL(file)));`,
                        ]),
                        '})();',
                        'null;',
                      ]
                )
              )
              compilation.emitAsset(entryOption, source)
              return
            }

            if (typeof entryOption === 'string') {
              emitFile(entryOption, initialFiles)
              continue
            }

            if (!manifest) {
              const manifestAsset = assets['manifest.json']
              const name = JSON.stringify(entry)
              if (!manifestAsset) {
                const e = new WebpackError(
                  `[webpack-extension-target] A manifest.json is required (required by options.experimental_output[${name}]). You can emit this file by using CopyPlugin or any other plugins.`
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
                  `[webpack-extension-target] Failed to parse manifest.json (required by options.experimental_output[${name}]).`
                )
                e.stack = ''
                e.file = 'manifest.json'
                compilation.errors.push(e)
                continue
              }
            }

            if (typeof entryOption === 'function') {
              entryOption(manifest, initialFiles)
            } else if (typeof entryOption === 'object') {
              emitFile(entryOption.file, initialFiles)
              entryOption.touch(manifest, entryOption.file)
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

/**
 *
 * @param {import('webpack').Compilation} compilation
 * @param {string} entry
 */
function getInitialFiles(compilation, entry) {
  const entryPoint = compilation.entrypoints.get(entry)
  if (!entryPoint) return undefined
  const allFiles = entryPoint.getFiles().filter((file) => file.endsWith('.js') && compilation.getAsset(file))
  if ('rspack' in compilation.compiler) {
    const runtimeChunk = entryPoint.getRuntimeChunk()
    if (runtimeChunk) {
      const files = new Set([...allFiles, ...runtimeChunk.files].reverse())
      return Array.from(files).reverse()
    }
  }
  return allFiles
}
