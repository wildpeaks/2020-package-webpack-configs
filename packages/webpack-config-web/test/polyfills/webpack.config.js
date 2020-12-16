/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "development",
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-polyfills": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-polyfills"]
			}
		],
		polyfills: [
			"module-window-polyfill",
			"./src/thirdparty/vanilla-polyfill.js",
			"./src/thirdparty/typescript-polyfill.ts"
		]
	});
};
