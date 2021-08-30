const { Compilation } = require('webpack')
const { RuntimeModule } = require('webpack')

class T extends RuntimeModule {
  apply(compilation: Compilation) {
    this.compilation.hooks.runtimeRequirementInTree.for('string').tap('WebExtensionRuntimePlugin', (chunk) => {
      compilation.addRuntimeModule(chunk, new RuntimeModule())
      return true
    })
  }
}
