const webpack = require('webpack')
const config = require('./utils/config')
test('mv2 basic test', (callback) => {
  webpack(
    config('./fixtures/mv3-basic', './snapshot/mv3-basic+esm', (config) => {
      config.output.environment = { dynamicImport: true }
    })
  ).run(callback)
})
