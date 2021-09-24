const { join } = require('path')
const WebExtensionPlugin = require('../../index')
const CopyPlugin = require('copy-webpack-plugin')

/**
 * @param {string} folder
 * @param {string} output
 * @returns {import('webpack').Configuration}
 */
module.exports = (folder, output = folder.replace('fixtures', 'snapshot')) => {
  return {
    devtool: false,
    entry: { background: './background.js', content: './content.js' },
    context: join(__dirname, '../', folder),
    mode: 'development',
    resolve: {
      alias: {
        'webpack-target-webextension/lib/background': join(__dirname, '../../lib/background.js'),
      },
    },
    output: {
      path: join(__dirname, '../', output),
      clean: true,
    },
    plugins: [
      new WebExtensionPlugin(),
      new CopyPlugin({
        patterns: [{ from: join(__dirname, '../fixtures/manifest-mv2.json'), to: 'manifest.json' }],
      }),
    ],
  }
}
