(() => { // webpackBootstrap
"use strict";
var __webpack_modules__ = ({
"./test.txt": (function (module, __unused_webpack_exports, __webpack_require__) {
module.exports = __webpack_require__.p + "6c5b191a31c5a9fc.txt";

}),
"./log.js": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  file: function() { return file; },
  mod: function() { return /* reexport module object */ _log_js__WEBPACK_IMPORTED_MODULE_0__; }
});
/* ESM import */var _log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./log.js */ "./log.js");


const file = 'log.js'


}),
"./util.js": (function (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  log: function() { return log; },
  test: function() { return test; }
});
function log(label, f) {
  return async () => {
    console.group(label)
    await Promise.resolve().then(f).catch(console.error)
    console.groupEnd()
  }
}
function test(expr, ...args) {
  if (expr) console.log('[✅]', ...args)
  else console.error('[❌]', ...args)
}


}),

});
/************************************************************************/
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId](module, module.exports, __webpack_require__);

// Return the exports of the module
return module.exports;

}

// expose the modules object (__webpack_modules__)
__webpack_require__.m = __webpack_modules__;

/************************************************************************/
// webpack/runtime/WebExtensionBrowserRuntime
(() => {
let isChrome, runtime;
try {
	if (typeof browser !== "undefined" && typeof browser.runtime?.getURL === "function") {
		runtime = browser;
	}
} catch (_) {}
if (!runtime) {
	try {
		if (typeof chrome !== "undefined" && typeof chrome.runtime?.getURL === "function") {
			isChrome = true;
			runtime = chrome;
		}
	} catch (_) {}
}
__webpack_require__.webExtRtModern = !isChrome;
__webpack_require__.webExtRt = runtime || {
	get runtime() {
		throw new Error("No chrome or browser runtime found");
	}
}
})();
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = function(exports, definition) {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = function (obj, prop) {
	return Object.prototype.hasOwnProperty.call(obj, prop);
};

})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = function(exports) {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};

})();
// webpack/runtime/public_path
(() => {
__webpack_require__.p = "/";

})();
// webpack/runtime/rspack_version
(() => {
__webpack_require__.rv = function () {
	return "1.1.5";
};

})();
// webpack/runtime/publicPath
(() => {
if (__webpack_require__.webExtRt) {
	__webpack_require__.p = __webpack_require__.webExtRt.runtime.getURL("/");
}
})();
// webpack/runtime/jsonp_chunk_loading
(() => {
__webpack_require__.b = document.baseURI || self.location.href;

      // object to store loaded and loading chunks
      // undefined = chunk not loaded, null = chunk preloaded/prefetched
      // [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
      var installedChunks = {"content": 0,};
      
})();
// webpack/runtime/rspack_unique_id
(() => {
__webpack_require__.ruid = "bundler=rspack@1.1.5";

})();
/************************************************************************/
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
/* ESM import */var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "./util.js");
/// <reference lib="dom" />
// @ts-check



Promise.resolve()
  .then(
    (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.log)('Test A: import.meta.url', () => {
      const url = new URL(/* asset import */__webpack_require__(/*! ./test.txt */ "./test.txt"), __webpack_require__.b).toString()
      ;(0,_util_js__WEBPACK_IMPORTED_MODULE_0__.test)(url.includes('-extension://'), "new URL('./test.txt', import.meta.url)\n", url)
    })
  )
  .then(
    (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.log)('Test B: __webpack_public_path__', () => {
      (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.test)(__webpack_require__.p.includes('-extension://'), '__webpack_public_path__\n', __webpack_require__.p)
    })
  )
  .then(
    (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.log)('Test C: dynamic import', async () => {
      console.log("await import('./log.js')\n")
      const mod = await Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./log.js */ "./log.js"))
      ;(0,_util_js__WEBPACK_IMPORTED_MODULE_0__.test)('file' in mod, mod)
    })
  )
  .then(() => {
    chrome.runtime.sendMessage('Hello from content script!')
    chrome.runtime.onMessage.addListener((message) => {
      console.log('Message from background:', message)
    })
  })

})()
;