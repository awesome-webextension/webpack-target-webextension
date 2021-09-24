const WebExtTemplatePlugin = require('./WebExtTemplatePlugin')

module.exports = class WebExtensionPlugin4 {
  /**
   * @param {any} nodeConfig
   * @param {import('./webpack4-used').Webpack4UsedImports} imports
   */
  constructor(nodeConfig, imports = getDefault()) {
    this.nodeConfig = nodeConfig
    this.imports = imports
  }
  apply(compiler) {
    const { LoaderTargetPlugin, NodeSourcePlugin, FunctionModulePlugin } = this.imports
    new WebExtTemplatePlugin(this.imports).apply(compiler)
    new FunctionModulePlugin().apply(compiler)
    if (this.nodeConfig) {
      new NodeSourcePlugin(this.nodeConfig).apply(compiler)
    }
    new LoaderTargetPlugin('web').apply(compiler)
  }
}
/**
 * @returns {import('./webpack4-used').Webpack4UsedImports}
 */
function getDefault() {
  return {
    JsonpChunkTemplatePlugin: require('webpack/lib/web/JsonpChunkTemplatePlugin'),
    JsonpHotUpdateChunkTemplatePlugin: require('webpack/lib/web/JsonpHotUpdateChunkTemplatePlugin'),
    SyncWaterfallHook: require('tapable').SyncWaterfallHook,
    Template: require('webpack/lib/Template'),
    FunctionModulePlugin: require('webpack/lib/FunctionModulePlugin'),
    NodeSourcePlugin: require('webpack/lib/node/NodeSourcePlugin'),
    LoaderTargetPlugin: require('webpack/lib/LoaderTargetPlugin'),
  }
}
