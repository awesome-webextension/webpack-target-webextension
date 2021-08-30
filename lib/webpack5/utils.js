// ! This file is copied from webpack/lib/util/identifier ! //
// because this function is not documented and exported as a public API of webpack
/**
 * @param {string} filename the filename which should be undone
 * @param {string} outputPath the output path that is restored (only relevant when filename contains "..")
 * @param {boolean} enforceRelative true returns ./ for empty paths
 * @returns {string} repeated ../ to leave the directory of the provided filename to be back on output dir
 */
exports.getUndoPath = (filename, outputPath, enforceRelative) => {
  let depth = -1
  let append = ''
  outputPath = outputPath.replace(/[\\/]$/, '')
  for (const part of filename.split(/[/\\]+/)) {
    if (part === '..') {
      if (depth > -1) {
        depth--
      } else {
        const i = outputPath.lastIndexOf('/')
        const j = outputPath.lastIndexOf('\\')
        const pos = i < 0 ? j : j < 0 ? i : Math.max(i, j)
        if (pos < 0) return outputPath + '/'
        append = outputPath.slice(pos + 1) + '/' + append
        outputPath = outputPath.slice(0, pos)
      }
    } else if (part !== '.') {
      depth++
    }
  }
  return depth > 0 ? `${'../'.repeat(depth)}${append}` : enforceRelative ? `./${append}` : append
}
