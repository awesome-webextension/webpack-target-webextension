;(async () => {
	const getURL = typeof browser === "object" ? browser.runtime.getURL : chrome.runtime.getURL;
	await import(getURL("test_txt-log_js-util_js.js"));
	await import(getURL("content.js"));
	await import(getURL("runtime.js"));
})();
null;