/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "development",
		polyfills: ["./src/both.polyfill.ts", "./src/only-main.polyfill.ts"],
		webworkerPolyfills: ["./both.polyfill", "./only-worker.polyfill", "module-self-polyfill"],
		sourcemaps: false,
		entry: {
			"app-webworker-polyfills": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-webworker-polyfills"]
			}
		]
	});
};
