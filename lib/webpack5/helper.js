/**
 * @param {import('webpack').Compilation} compilation
 * @param {typeof import('webpack').Template} Template
 * @returns {{f: (args: string, body: string | string[]) => string, retF: (returnValue: string, args?: string) => string}}
 */
module.exports.TemplateFn = (compilation, Template) => {
  return {
    f: (args, body) => {
      if (!compilation) throw new TypeError('No compilation is found.')
      if (compilation.runtimeTemplate) return compilation.runtimeTemplate.basicFunction(args, body)

      // rspack
      return compilation.outputOptions.environment.arrowFunction
        ? `(${args}) => {\n${Template.indent(body)}\n}`
        : `function(${args}) {\n${Template.indent(body)}\n}`
    },
    retF: (returnValue, args = '') => {
      if (!compilation) throw new TypeError('No compilation is found.')
      if (compilation.runtimeTemplate) return compilation.runtimeTemplate.returningFunction(returnValue, args)

      // rspack
      return compilation.outputOptions.environment.arrowFunction
        ? `(${args}) => (${returnValue})`
        : `function(${args}) { return ${returnValue}; }`
    },
  }
}

/**
 *
 * @param {import('webpack').Compilation} compilation
 * @param {string} entry
 */
module.exports.getInitialFiles = (compilation, entry) => {
  const entryPoint = compilation.entrypoints.get(entry)
  if (!entryPoint) return []
  const allFiles = entryPoint.getFiles().filter((file) => file.endsWith('.js') && compilation.getAsset(file))
  if ('rspack' in compilation.compiler) {
    const runtimeChunk = entryPoint.getRuntimeChunk()
    if (runtimeChunk) {
      const files = new Set([...allFiles, ...runtimeChunk.files].reverse())
      return Array.from(files).reverse()
    }
  }
  return allFiles
}
