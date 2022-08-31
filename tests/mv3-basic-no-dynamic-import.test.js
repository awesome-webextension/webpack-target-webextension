const webpack = require('webpack')
const config = require('./utils/config')
test('mv3 basic test (no dynamic import)', (callback) => {
  webpack(
    config('./fixtures/mv3-basic-no-dynamic-import', './snapshot/mv3-basic-no-dynamic-import', (config) => {})
  ).run(callback)
})
