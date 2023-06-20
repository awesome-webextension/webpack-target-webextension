const webpack = require('webpack')
const config = require('./utils/config')
test('mv3 basic test', (callback) => {
  webpack(
    config(
      './fixtures/mv3-basic',
      './snapshot/mv3-both',
      (config) => {
        config.entry.backgroundWorker = './background.js'
      },
      { background: { pageEntry: 'background', serviceWorkerEntry: 'backgroundWorker' } }
    )
  ).run(callback)
})
