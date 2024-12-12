"use strict";
(self['webpackChunk'] = self['webpackChunk'] || []).push([["test_txt-log_js-util_js"], {
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

}]);