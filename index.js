const WebExtTemplatePlugin = require('./lib/WebExtTemplatePlugin')
const FunctionModulePlugin = require('webpack/lib/FunctionModulePlugin')
const NodeSourcePlugin = require('webpack/lib/node/NodeSourcePlugin')
const LoaderTargetPlugin = require('webpack/lib/LoaderTargetPlugin')

module.exports = nodeConfig => compiler => {
  new WebExtTemplatePlugin().apply(compiler)
  new FunctionModulePlugin().apply(compiler)
  if (nodeConfig) {
    new NodeSourcePlugin(nodeConfig).apply(compiler)
  }
  new LoaderTargetPlugin('web').apply(compiler)
}
