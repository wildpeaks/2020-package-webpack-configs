/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-web");

module.exports = function() {
	return getConfig({
		mode: "development",
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-webworker-no-export": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-webworker-no-export"]
			}
		]
	});
};
