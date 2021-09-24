const webpack = require('webpack')
const config = require('./utils/config')
test('mv3 basic test', (callback) => {
  webpack(config('./fixtures/mv3-basic')).run(callback)
})
