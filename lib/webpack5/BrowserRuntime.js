// @ts-check
module.exports = [
  `var isBrowser = !!(() => { try { if (typeof browser.runtime.getURL === "function") return true } catch(e) {} })()`,
  `var isChrome = !!(() => { try { if (typeof chrome.runtime.getURL === "function") return true } catch(e) {} })()`,
  // code might be run in child compiler...
  `var isChildCompiler = !(typeof self === 'object' && self.addEventListener)`,
  // browser is used on Firefox and rest
  `var runtime = isBrowser ? browser : isChrome ? chrome : isChildCompiler ? { runtime: { getURL(x) { return x } } } : { get runtime() { throw new Error("No chrome or browser runtime found") } }`,
]
