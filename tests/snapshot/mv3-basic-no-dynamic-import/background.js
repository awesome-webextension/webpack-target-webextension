/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./x.js":
/*!**************!*\
  !*** ./x.js ***!
  \**************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "x": () => (/* binding */ x)
/* harmony export */ });
const x = 1


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/chunk loader fallback */
/******/ 	(() => {
/******/ 		  const isModern = !!(() => {
/******/ 		    try {
/******/ 		      if (typeof browser.runtime.getURL === 'function') return true;
/******/ 		    } catch (err) {}
/******/ 		  })();
/******/ 		  const runtime = isModern ? browser : chrome;
/******/ 		  runtime.runtime.onMessage.addListener((message, sender, sendResponse) => {
/******/ 		    const cond = message && message.type === 'WTW_INJECT' && sender && sender.tab && sender.tab.id != null;
/******/ 		    if (!cond) return;
/******/ 		    let file = message.file;
/******/ 		
/******/ 		    try {
/******/ 		      file = new URL(file).pathname;
/******/ 		    } catch {}
/******/ 		
/******/ 		    if (!file) return;
/******/ 		    const details = {
/******/ 		      frameId: sender.frameId,
/******/ 		      file
/******/ 		    };
/******/ 		
/******/ 		    if (runtime.scripting) {
/******/ 		      runtime.scripting.executeScript({
/******/ 		        target: {
/******/ 		          tabId: sender.tab.id
/******/ 		        },
/******/ 		        files: [file]
/******/ 		      }).then(sendResponse);
/******/ 		    } else {
/******/ 		      if (isModern) {
/******/ 		        runtime.tabs.executeScript(sender.tab.id, details).then(sendResponse);
/******/ 		      } else {
/******/ 		        runtime.tabs.executeScript(sender.tab.id, details, sendResponse);
/******/ 		      }
/******/ 		    }
/******/ 		
/******/ 		    return true;
/******/ 		  });
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/eagerly load chunks */
/******/ 	(() => {
/******/ 		__webpack_require__.e("background")
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!***********************!*\
  !*** ./background.js ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _x_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./x.js */ "./x.js");

console.log(_x_js__WEBPACK_IMPORTED_MODULE_0__.x)

})();

/******/ })()
;