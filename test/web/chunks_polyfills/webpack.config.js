/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-web");

module.exports = function() {
	return getConfig({
		mode: "development",
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-chunks-polyfills": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-chunks-polyfills"]
			}
		],
		polyfills: [
			"module-window-polyfill",
			"./src/thirdparty/vanilla-polyfill.js",
			"./src/thirdparty/typescript-polyfill.ts"
		]
	});
};
