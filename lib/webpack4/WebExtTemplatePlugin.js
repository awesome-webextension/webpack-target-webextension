const WebExtMainTemplatePlugin = require('./WebExtMainTemplatePlugin')
const JsonpChunkTemplatePlugin = require('webpack/lib/web/JsonpChunkTemplatePlugin')
const JsonpHotUpdateChunkTemplatePlugin = require('webpack/lib/web/JsonpHotUpdateChunkTemplatePlugin')

class WebExtTemplatePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('WebExtTemplatePlugin', compilation => {
      new WebExtMainTemplatePlugin().apply(compilation.mainTemplate)
      new JsonpChunkTemplatePlugin().apply(compilation.chunkTemplate)
      new JsonpHotUpdateChunkTemplatePlugin().apply(
        compilation.hotUpdateChunkTemplate
      )
    })
  }
}

module.exports = WebExtTemplatePlugin
