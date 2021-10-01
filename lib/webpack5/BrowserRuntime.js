// @ts-check
module.exports = [
  `var isBrowser = typeof browser === 'object';`,
  // browser is used on Firefox and rest
  `var runtime = isBrowser ? browser : typeof chrome === 'object' ? chrome : { get runtime() { throw new Error("No chrome or browser runtime found") } }`,
]
