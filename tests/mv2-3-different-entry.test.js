const webpack = require('webpack')
const config = require('./utils/config')
test('mv2 + mv3 basic test', (callback) => {
  webpack(
    config(
      './fixtures/mv3-both',
      './snapshot/mv3-both',
      (config) => {
        config.entry.backgroundWorker = './background.js'
      },
      { background: { pageEntry: 'background', serviceWorkerEntry: 'backgroundWorker' } }
    )
  ).run(callback)
})
