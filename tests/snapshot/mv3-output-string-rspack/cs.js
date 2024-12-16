;(() => {
	const getURL = typeof browser === "object" ? browser.runtime.getURL : chrome.runtime.getURL;
	["test_txt-util_js.js","content.js","runtime.js"].forEach(file => import(getURL(file)));
})();
null;