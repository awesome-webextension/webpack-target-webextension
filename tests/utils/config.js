const { join } = require('path')
const WebExt = require('../../index')

/**
 * @param {string} folder
 * @param {string} output
 * @returns {import('webpack').Configuration}
 */
module.exports = (folder, output) => {
  return {
    entry: { background: './background.js', content: './content.js' },
    context: join(__dirname, '../', folder),
    mode: 'development',
    output: {
      path: join(__dirname, '../', output),
    },
    plugins: [new WebExt()],
  }
}
