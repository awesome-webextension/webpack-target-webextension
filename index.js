module.exports = function WebpackSwitchPlugin(...args) {
  if (new.target) {
    const Webpack5 = require('./lib/webpack5/index.js')
    return new Webpack5(...args)
  }
  const Webpack4 = require('./lib/webpack4/index.js')
  return Webpack4(...args)
}
