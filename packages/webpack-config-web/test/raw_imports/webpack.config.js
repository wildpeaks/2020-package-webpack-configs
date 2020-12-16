/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "development",
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-raw-imports": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-raw-imports"]
			}
		],
		rawExtensions: ["txt", "liquid"]
	});
};
