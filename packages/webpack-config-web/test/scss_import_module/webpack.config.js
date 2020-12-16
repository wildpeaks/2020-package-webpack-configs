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
			"app-scss-import-module": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-scss-import-module"]
			}
		]
	});
};
