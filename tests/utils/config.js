const { join } = require('path')
const WebExtensionPlugin = require('../../index').default
const CopyPlugin = require('copy-webpack-plugin')

/**
 * @param {string} folder
 * @param {string} output
 * @param {(config: import('webpack').Configuration) => void} [modify]
 * @param {import('../../index').WebExtensionPluginOptions} [arg]
 * @returns {import('webpack').Configuration}
 */
module.exports = (folder, output = folder.replace('fixtures', 'snapshot'), modify, arg) => {
  const isMV3 = folder.includes('mv3')
  const manifest = join(__dirname, isMV3 ? '../fixtures/manifest-mv3.json' : '../fixtures/manifest-mv2.json')
  /** @type {import('webpack').Configuration} */
  const config = {
    mode: 'development',
    context: join(__dirname, '../', folder),
    devtool: false,
    entry: { background: './background.js', content: './content.js' },
    output: {
      path: join(__dirname, '../', output),
      clean: true,
    },
    plugins: [
      new WebExtensionPlugin(arg ?? {
        background: { ...(isMV3 ? { serviceWorkerEntry: 'background' } : { pageEntry: 'background' }) },
      }),
      new CopyPlugin({
        patterns: [{ from: manifest, to: 'manifest.json' }],
      }),
    ],
  }
  modify && modify(config)
  return config
}
