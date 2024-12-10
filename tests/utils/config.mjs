import webpack from 'webpack'
import * as rspack from '@rspack/core'
import { join } from 'path'
import { fileURLToPath } from 'url'
import WebExtensionPlugin from '../../index.js'
import CopyPlugin from 'copy-webpack-plugin'

const __dirname = join(fileURLToPath(import.meta.url), '..')
/**
 * @typedef {Object} Run
 * @property {string} input - The input path.
 * @property {string} output - The output path.
 * @property {(config: import('webpack').Configuration | import('@rspack/core').Configuration, rspack: undefined | typeof import('@rspack/core')) => void} [touch] - Change the default option.
 * @property {import('../../index.js').WebExtensionPluginOptions} option - Option of WebExtensionPluginOptions.
 * @property {(manifest: any) => void} [touchManifest] - Change the manifest file.
 */

export function run(
  /**
   * @type {Run} param0
   */ { input, output, option, touch, touchManifest }
) {
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
      environment: { arrowFunction: true, const: true, optionalChaining: true, globalThis: true },
    },
    plugins: [new WebExtensionPlugin(option), new CopyPlugin(copyPluginOptions)],
  }
  touch && touch(config, undefined)

  /** @type {import('webpack').Configuration} */
  const rspackConfig = {
    ...config,
    module: { parser: { javascript: { dynamicImportMode: 'eager' } } },
    output: {
      ...config.output,
      path: join(__dirname, '../', output + '-rspack'),
      hotUpdateChunkFilename: 'hot/[id].js',
      hotUpdateMainFilename: 'hot/[runtime].json',
    },
    plugins: [new WebExtensionPlugin(option), new rspack.CopyRspackPlugin(copyPluginOptions)],
  }
  touch && touch(rspackConfig, rspack)

  return Promise.all([
    //
    compile(webpack(config)),
    compile(rspack.rspack(rspackConfig)),
  ])
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
