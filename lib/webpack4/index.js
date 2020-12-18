const WebExtTemplatePlugin = require('./WebExtTemplatePlugin')
const FunctionModulePlugin = require('webpack/lib/FunctionModulePlugin')
const NodeSourcePlugin = require('webpack/lib/node/NodeSourcePlugin')
const LoaderTargetPlugin = require('webpack/lib/LoaderTargetPlugin')
module.exports = class WebExtensionPlugin4 {
  constructor(nodeConfig) {
    this.nodeConfig = nodeConfig
  }
  apply(compiler) {
    new WebExtTemplatePlugin().apply(compiler)
    new FunctionModulePlugin().apply(compiler)
    if (this.nodeConfig) {
      new NodeSourcePlugin(this.nodeConfig).apply(compiler)
    }
    new LoaderTargetPlugin('web').apply(compiler)
  }
}
