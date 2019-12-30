/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-web");

module.exports = function() {
	return getConfig({
		mode: "production",
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-production": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-production"]
			}
		]
	});
};
