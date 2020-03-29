const WebExtTemplatePlugin = require('./lib/WebExtTemplatePlugin')
const FunctionModulePlugin = require('webpack/lib/FunctionModulePlugin')
const NodeSourcePlugin = require('webpack/lib/node/NodeSourcePlugin')

module.exports = nodeConfig => compiler => {
  new WebExtTemplatePlugin().apply(compiler)
  new FunctionModulePlugin().apply(compiler)
  nodeConfig && new NodeSourcePlugin(nodeConfig).apply(compiler)
}
