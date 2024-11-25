/**
 *
 * @param {import('webpack').Compilation} compilation
 * @param {typeof import('webpack').Template} Template
 * @returns {(args: string, body: string | string[]) => string}
 */
module.exports.TemplateFn = (compilation, Template) => (args, body) => {
  if (!compilation) throw new TypeError('No compilation is found.')
  if (compilation.runtimeTemplate) return compilation.runtimeTemplate.basicFunction(args, body)

  // rspack
  return compilation.outputOptions.environment.arrowFunction
    ? `(${args}) => {\n${Template.indent(body)}\n}`
    : `function(${args}) {\n${Template.indent(body)}\n}`
}
