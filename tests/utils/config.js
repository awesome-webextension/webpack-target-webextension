const webpack = require('webpack')
const rspack = require('@rspack/core')
const { join } = require('path')
const WebExtensionPlugin = require('../../index').default
const CopyPlugin = require('copy-webpack-plugin')

/**
 * @typedef {Object} Run
 * @property {() => void} done - The callback function.
 * @property {string} input - The input path.
 * @property {string} output - The output path.
 * @property {(config: import('webpack').Configuration) => void} [touch] - Change the default option.
 * @property {import('../../index').WebExtensionPluginOptions} option - Option of WebExtensionPluginOptions.
 * @property {(manifest: any) => void} [touchManifest] - Change the manifest file.
 */

/**
 * @param {Run} param0
 */
module.exports = ({ done, input, output, option, touch, touchManifest }) => {
  const isMV3 = output.includes('mv3')
  const manifest = join(__dirname, isMV3 ? '../fixtures/manifest-mv3.json' : '../fixtures/manifest-mv2.json')
  const copyPluginOptions = {
    patterns: [
      {
        from: manifest,
        to: 'manifest.json',
        transform: touchManifest
          ? (content) => {
              if (content instanceof Buffer) content = content.toString('utf8')
              const json = JSON.parse(content)
              touchManifest(json)
              return JSON.stringify(json, undefined, 4)
            }
          : undefined,
      },
    ],
  }
  /** @type {import('webpack').Configuration} */
  const config = {
    mode: 'development',
    context: join(__dirname, '../', input),
    devtool: false,
    entry: { background: './background.js', content: './content.js' },
    output: {
      path: join(__dirname, '../', output),
      clean: true,
      chunkFilename: 'chunks-[chunkhash].js',
    },
    plugins: [new WebExtensionPlugin(option), new CopyPlugin(copyPluginOptions)],
  }
  touch && touch(config)

  /** @type {import('webpack').Configuration} */
  const rspackConfig = {
    ...config,
    module: { parser: { javascript: { dynamicImportMode: 'eager' } } },
    output: {
      path: join(__dirname, '../', output + '-rspack'),
      clean: true,
      chunkFilename: 'chunks-[chunkhash].js',
    },
    plugins: [new WebExtensionPlugin(option), new rspack.CopyRspackPlugin(copyPluginOptions)],
  }

  Promise.all([
    //
    compile(webpack(config)),
    compile(rspack.rspack(rspackConfig)),
  ]).then(() => done(), done)
}
/**
 * @param {webpack.Compiler | rspack.Compiler} compiler
 */
function compile(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) return reject(error)
      if (!stats) return reject(new TypeError('stats from compiler is null'))
      return resolve(stats)
    })
  })
}
