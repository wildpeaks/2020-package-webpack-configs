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
			"app-externals-commonjs-array": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-externals-commonjs-array"]
			}
		]
	});
	config.externals = {
		fake1: ["./thirdparty/polyfills.js", "dummy1"],
		fake2: ["./thirdparty/polyfills.js", "dummy2"]
	};
	return config;
};
