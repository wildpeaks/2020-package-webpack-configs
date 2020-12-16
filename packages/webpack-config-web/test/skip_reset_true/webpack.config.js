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
			"app-skip-true": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-skip-true"]
			}
		],
		skipReset: true
	});
};
