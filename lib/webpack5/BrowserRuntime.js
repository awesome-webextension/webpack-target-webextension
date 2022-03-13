// @ts-check
const basic = [
  `var noBrowser = !(() => { try { return browser.runtime.getURL("/") } catch(e) {} })()`,
  `var noChrome = !(() => { try { return chrome.runtime.getURL("/") } catch(e) {} })()`,
]
const strong = [
  ...basic,
  `var runtime = noBrowser ? noChrome ? { get runtime() { throw new Error("No chrome or browser runtime found") } } : chrome : browser`,
]
const weak = [
  ...basic,
  `var runtime = noBrowser ? noChrome ? (typeof self === 'object' && self.addEventListener) ? { get runtime() { throw new Error("No chrome or browser runtime found") } } : { runtime: { getURL: x => x } } : chrome : browser`,
]

module.exports = (getWeak = false) => (getWeak ? weak : strong)
