const WebExtMainTemplatePlugin = require('./WebExtMainTemplatePlugin')

class WebExtTemplatePlugin {
  /**
   * @param {import('./webpack4-used').Webpack4UsedImports} imports
   */
  constructor(imports) {
    this.imports = imports
  }
  apply(compiler) {
    const { JsonpChunkTemplatePlugin, JsonpHotUpdateChunkTemplatePlugin } = this.imports
    compiler.hooks.thisCompilation.tap('WebExtTemplatePlugin', (compilation) => {
      new WebExtMainTemplatePlugin(this.imports).apply(compilation.mainTemplate)

      new JsonpChunkTemplatePlugin().apply(compilation.chunkTemplate)
      new JsonpHotUpdateChunkTemplatePlugin().apply(compilation.hotUpdateChunkTemplate)
    })
  }
}

module.exports = WebExtTemplatePlugin
