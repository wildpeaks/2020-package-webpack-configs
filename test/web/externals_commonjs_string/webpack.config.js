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
			"app-externals-commonjs-string": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-externals-commonjs-string"]
			}
		]
	});
	config.externals = {
		fake1: "./thirdparty/polyfills.js",
		fake2: "./thirdparty/polyfills.js"
	};
	return config;
};
