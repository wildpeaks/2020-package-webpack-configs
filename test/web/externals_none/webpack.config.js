/* eslint-env node */
"use strict";
const getConfig = require("@wildpeaks/webpack-config-web");

module.exports = function() {
	const config = getConfig({
		mode: "development",
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-externals-none": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-externals-none"]
			}
		]
	});
	config.externals = {};
	return config;
};
