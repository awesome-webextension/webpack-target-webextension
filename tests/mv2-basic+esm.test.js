const webpack = require('webpack')
const config = require('./utils/config')
test('mv2 basic test', (callback) => {
  webpack(
    config('./fixtures/mv2-basic', './snapshot/mv2-basic+esm', (config) => {
      config.output.environment = { dynamicImport: true }
    })
  ).run(callback)
})
