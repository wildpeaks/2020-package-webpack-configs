/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	return getConfig({
		rootFolder: __dirname,
		mode: "production",
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-production-skip-hashes": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-production-skip-hashes"]
			}
		],
		skipHashes: true
	});
};
