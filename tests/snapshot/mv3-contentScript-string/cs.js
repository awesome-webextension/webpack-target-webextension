;(async () => {
	const getURL = typeof browser === "object" ? browser.runtime.getURL : chrome.runtime.getURL;
	await import(getURL("runtime.js"));
	await import(getURL("test_txt-util_js.js"));
	await import(getURL("content.js"));
})();
null;