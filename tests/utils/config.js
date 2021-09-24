const { join } = require('path')
const WebExtensionPlugin = require('../../index').default
const CopyPlugin = require('copy-webpack-plugin')

/**
 * @param {string} folder
 * @param {string} output
 * @returns {import('webpack').Configuration}
 */
module.exports = (folder, output = folder.replace('fixtures', 'snapshot')) => {
  const isMV3 = folder.includes('mv3')
  const manifest = join(__dirname, isMV3 ? '../fixtures/manifest-mv3.json' : '../fixtures/manifest-mv2.json')
  return {
    mode: 'development',
    context: join(__dirname, '../', folder),
    devtool: false,
    entry: { background: './background.js', content: './content.js' },
    output: {
      path: join(__dirname, '../', output),
      clean: true,
    },
    plugins: [
      new WebExtensionPlugin({
        background: { entry: 'background', manifest: isMV3 ? 3 : 2 },
      }),
      new CopyPlugin({
        patterns: [{ from: manifest, to: 'manifest.json' }],
      }),
    ],
  }
}
