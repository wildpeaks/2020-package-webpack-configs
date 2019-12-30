/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-web");

module.exports = function() {
	return getConfig({
		mode: "development",
		polyfills: [],
		webworkerPolyfills: [],
		entry: {
			"app-sourcemaps": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-sourcemaps"]
			}
		],
		sourcemaps: true
	});
};
