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
			"app-externals-globals": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-externals-globals"]
			}
		]
	});
	config.externals = {
		fake1: "FAKE_1",
		fake2: "window.FAKE_2"
	};
	return config;
};
