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
			"app-externals-replace": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-externals-replace"]
			}
		]
	});
	config.externals = {
		fake1: ["./thirdparty/polyfills.js", "dummy1"]
	};
	return config;
};
